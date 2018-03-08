export const help = scope => 
{
    scope.message("Commands");

    scope.message("mvc:controller:create {controller_name} [-v --type]");
    scope.message("Creates a Controller based on Given name and type.");
    scope.message("PS:\nIf no type is passed then default is .js");
    scope.message("");

    scope.message("mvc:entity:create {entity_name} [-v --type]");
    scope.message("Creates an Entity based on given name and type.");
    scope.message("PS:\nIf no type is passed the default is .js");

    return scope;
};
