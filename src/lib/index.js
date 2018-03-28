export class AppCLI 
{
    constructor() 
    {
        this.commands = [];
        this.retrieveMessage = false;
    }

    register(route, command) 
    {
        this.commands.push({
            route: new AppCLIRoute(route),
            command
        });

        return this;
    }

    retrieveMessages() 
    {
        this.retrieveMessage = true;
        return this;
    }

    exec(args) 
    {
        let options = {},
            params = args
                .map(p => 
                {
                    if (p.substr(0, 1) === "-") 
                    {
                        let [field, value] = p.split("=");
                        options[field] = value ? value : true;
                        return false;
                    }

                    return p;
                })
                .filter(p => (!p ? false : true));

        for (let i = 0; i < this.commands.length; i++) 
        {
            let match = this.commands[i].route.match(params);
            if (match instanceof AppCLIRoute) 
            {
                let response = this.commands[i].command(new AppCLIScope(
                    match.setOptions(options),
                    this.retrieveMessage
                ));
                if (!(response instanceof Promise))
                    response = Promise.resolve(response);

                return response;
            }
        }

        return null;
    }
}

class AppCLIRoute 
{
    constructor(route) 
    {
        this.route = Array.isArray(route) ? route : route.split(" ");
        this.options = {};
    }

    match(currentRoute) 
    {
        if (this.route.length !== currentRoute.length) return null;

        let routeObject = [];
        for (let i = 0; i < currentRoute.length; i++) 
        {
            let regexVar = /\{[a-zA-Z_-]+\}/;
            if (
                !regexVar.test(typeof this.route[i] === "object"
                    ? this.route[i].value
                    : this.route[i]) &&
                currentRoute[i] !== this.route[i]
            )
                return null;

            routeObject.push(regexVar.test(this.route[i])
                ? {
                    key: this.route[i].replace("{", "").replace("}", ""),
                    value: currentRoute[i]
                }
                : currentRoute[i]);
        }

        return new AppCLIRoute(routeObject);
    }

    getParams() 
    {
        let params = {};
        this.route.forEach(p => (typeof p === "object" ? (params[p.key] = p.value) : null));

        return params;
    }

    getOptions() 
    {
        return this.options;
    }

    setOptions(options) 
    {
        this.options = options;
        return this;
    }
}

class AppCLIScope 
{
    constructor(route, retrieveMessage = false) 
    {
        this.route = route;
        this.retrieveMessage = retrieveMessage;
        this.messages = [];
        this.errors = {};

        this.message("SSSSSSS SSSSSSS SSSS    SS  SS SS      SS SSSSSSS SSSSSSSS");
        this.message("SS      SSSSSSS SS SS   SS SS  SS      SS SS      SSSSSSSS");
        this.message("SSSSSS  SS   SS SS  SS  SSS    SS         SSSSSS     SS   ");
        this.message("SS      SS   SS SSSSS   SSS    SS      SS SS         SS   ");
        this.message("SS      SSSSSSS SS  SS  SS SS  SS      SS SS         SS   ");
        this.message("SS      SSSSSSS SS   SS SS  SS SSSSSSS SS SS         SS   ");
        this.message("");
        this.message("                  Powered by Parpe");
        this.message("\n");
    }

    hasErrors() 
    {
        return Object.keys(this.errors).length > 0;
    }

    message(...message) 
    {
        this.messages.push(...message);
        if (!this.retrieveMessage) console.log(...message);
    }

    error(field, message) 
    {
        if (typeof this.errors[field] === "undefined") this.errors[field] = [];

        this.errors[field].push(message);

        this.message(`Error: ${field}`);
        this.message(`Message: ${message}`);
    }

    getRoute() 
    {
        return this.route;
    }

    retrieve() 
    {
        return this.hasErrors() ? this.errors : this.messages;
    }
}
