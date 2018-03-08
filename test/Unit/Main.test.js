import { CLI } from "./../../bin/forklift";

describe("Unit/Main", () => 
{
    describe("Info", () => 
    {
        it("Should present informations", done => 
        {
            CLI.retrieveMessages()
                .exec(["help"])
                .then(scope => scope.retrieve())
                .then(response => console.log(response))
                .then(() => done());
        });
    });
});
