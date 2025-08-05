---
title: Secure Environment Variable Injection using AzAPI & AzureRM
date: 2025/08/05
draft: false
layout: full-width
---

____

# Secure Environment Variable Injection using AzAPI & AzureRM

2025/08/05
____


## Framing the problem

[Full code can be found here.](https://github.com/MrThygesen16/tf-aci-secret-inject)

When creating Container Instances in Azure, it is recommended to provision a Managed Identity alongside the Container Instance. We can use this Managed Identity to generate an Entra ID token & use that for Authentication. A prime example would be provisioning Container Instances for privately hosted Azure DevOps agents. 

The benefits of this approach means we don't have to worry about handling secrets; no need for a key-vault or secure variables in Azure DevOps. More importantly, this means we are not writing any secrets to State in Terraform. Writing secrets directly to state leads to a problem called ["Secret Sprawl"](https://www.hashicorp.com/en/resources/what-is-secret-sprawl-why-is-it-harmful):
> Secret Sprawl is the uncontrolled and unmanaged proliferation of sensitive information like API keys, passwords, and encryption keys across an organization's digital environment. This happens when these secrets are scattered across various systems, applications, and even unsecured communication channels without proper tracking or control. 


The above solution works well when using a Linux-based container image. For Windows Containers however, it is a different story.

[Microsoft Documentation on Container Instances highlights this issue:](https://learn.microsoft.com/en-us/azure/container-instances/container-instances-managed-identity#managed-identity-on-windows-containers)

> Managed Identity on Windows container groups works differently than Linux container groups. **For Windows containers, metadata server (169.254.169.254) is not available for getting the Microsoft Entra ID token**.

The docs further state:
> **Az Login module and other client libraries which depend on metadata server (169.254.169.254) will not work in a Windows Container. Additionally, Windows containers in vNet won't be able to connect to the endpoint; hence, a managed identity token can't be generated in a Windows virtual network container.**

Essentially, doing the approach described above (using a managed identity to create an Entra ID token) is not possible.

Let's take the following Terraform snippet(s) as an example:

1. First we will create a resource group
```hcl
# main.tf
resource "azurerm_resource_group" "this" {
  name     = "rg-acg-example-01"
  location = "AustraliaEast"
}

```

2. Create a container group
```hcl
# main.tf (cont.) - Insecure Windows Container Group
resource "azurerm_container_group" "unsecure" {
  name                = "acg-windows-insecure-01"
  location            = azurerm_resource_group.this.location
  resource_group_name = azurerm_resource_group.this.name
  os_type             = "Windows"

  container {
    name   = "aci-win-02"
    image  = "mcr.microsoft.com/windows/servercore:ltsc2022"
    cpu    = "0.5"
    memory = "0.5"

    ports {
      port     = "22"
      protocol = "TCP"
    }

    commands = []
    
    ## secrets added to state
    environment_variables = { 
        "non_secure_var" = "NonSecureValueExposed" 
    }
    # Would be better to pass this in as a variable
    # but for the sake of this demo -- this is simpler
    secure_environment_variables = { 
        "secure_var" = "SecureValueExposed" 
    }
  }
}
```

We can check the Azure portal and confirm that our two environment variables have been added to the Container.
Furthermore, notice that Azure does not display the value of the environment variable `secure_var`.
    
| Key           | Value          |
|---------------|----------------|
| non_secure_var|  NonSecureValue|
| secure_var    |                |

However, when we look at our State file, we can see that the secrets - including the secure variable is stored in plain-text.
```json
// terraform.tfstate
"environment_variables": {
    "non_secure_var": "NonSecureValue"
},
"secure_environment_variables": {
    "secure_var": "SecureValue"
},
```


Unfortunately, this means that anyone who has read-access to state can view these secrets. 


## Solution

We can solve this issue by using AzAPI.

1. Create another Container group; this time we don't add the secrets in, and instead add a lifecycle ignore block on the environment variables object (otherwise Terraform will complain)
```hcl
# main.tf (cont.) Secure Windows Container Group
resource "azurerm_container_group" "secure" {
  name                = "acg-windows-secure-01"
  location            = azurerm_resource_group.this.location
  resource_group_name = azurerm_resource_group.this.name
  os_type             = "Windows"

  container {
    name   = "aci-win-01"
    image  = "mcr.microsoft.com/windows/servercore:ltsc2022"
    cpu    = "0.5"
    memory = "0.5"

    ports {
      port     = "22"
      protocol = "TCP"
    }

    ## let azapi inject these secrets
    # commands = []
    # environment_variables = {}
  }

  lifecycle {
    ignore_changes = [
      container[0].environment_variables,
      container[0].commands,
    ]
  }
}
```

2. Next we use AzAPI to Stop the container by sending a POST request to the Container Group
```hcl
# main.tf (cont.) stop container group
resource "azapi_resource_action" "stop_container_group" {
  type        = "Microsoft.ContainerInstance/containerGroups@2023-05-01"
  resource_id = azurerm_container_group.secure.id
  action      = "stop"
  method      = "POST"
}
```


3. Also using AzAPI, we use the resource `update_resource` to inject the variables. 
```hcl
# main.tf (cont.) inject secrets
resource "azapi_update_resource" "inject_secrets" {
  type        = "Microsoft.ContainerInstance/containerGroups@2023-05-01"
  resource_id = azurerm_container_group.secure.id
  
  # rather than using `body`, we use `sensitive_body`
  sensitive_body = {
    properties = {
      containers = [
        {
          name = azurerm_container_group.secure.container[0].name
          properties = {
            environmentVariables = [
              {
                name  = "non_secure_var"
                value = "NonSecureValueHidden"
              },
              {
                name        = "secure_var"
                secureValue = "SecureValueHidden"
              }
            ]
          }
        }
      ]
    }
  }
}
```

The reason we are able to update these values and not have them written to state is due to the introduction of ["Ephemeral Resources & Write-Only Attributes in Terraform"](https://registry.terraform.io/providers/Azure/azapi/latest/docs/guides/feature_ephemeral_resource#write-only-attributes):
> Write-only arguments let you securely pass temporary values to Terraform's managed resources during an operation without persisting those values to state or plan files.
>
> The AzAPI provider supports sensitive_body to define attributes that are not stored in the state file, ensuring sensitive information remains secure


4. Lastly, we start the container group again.
```hcl
# main.tf (cont.) start container group
resource "azapi_resource_action" "start_container_group" {
  type        = "Microsoft.ContainerInstance/containerGroups@2022-05-01"
  resource_id = azurerm_container_group.secure.id
  action      = "start"
  method      = "POST"

  depends_on = [
    azapi_update_resource.inject_secrets, 
    azapi_resource_action.stop_container_group
  ]
}
```

This is purely anecdotal, but I've found that stopping, injecting secrets, and then starting the container group yields more consistent results.

Finally, when we take a look at the state file for the container where we injected the secrets, we can see that neither the non-secure, nor the secure environment variables have been written to state.

```json
// terraforn.tfstate
"environment_variables": null,
"secure_environment_variables": null
```