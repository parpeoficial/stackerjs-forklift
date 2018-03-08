import { unlinkSync, existsSync } from "fs";
import { expect } from "chai";
import { CLI } from "./../../../bin/forklift";

describe("Unit/MVC/ControllerTest", () => 
{
    describe("MVC:Controller:Create", () => 
    {
        it("Should create a JS Controller", done => 
        {
            CLI.retrieveMessages()
                .exec(["mvc:controller:create", "ExampleController.js", "-v"])
                .then(scope => 
                {
                    let response = scope.retrieve();
                    expect(response)
                        .to.be.an("Array")
                        .and.contain("Creating ExampleController.js...")
                        .and.contain("Controller ExampleController created");
                })
                .then(() => done());
        });

        it("Should create a JS Controller without set type", done => 
        {
            CLI.retrieveMessages()
                .exec(["mvc:controller:create", "ExampleController"])
                .then(scope => 
                {
                    scope.retrieve();
                    expect(existsSync(process.cwd() + "/ExampleController.js"))
                        .to.be.true;
                })
                .then(() => done());
        });

        it("Should create a TS Controller", done => 
        {
            CLI.retrieveMessages()
                .exec(["mvc:controller:create", "ExampleController.ts", "-v"])
                .then(scope => scope.retrieve())
                .then(response =>
                    expect(response)
                        .to.be.an("Array")
                        .and.contain("Creating ExampleController.ts...")
                        .and.contain("Controller ExampleController created"))
                .then(() => done());
        });

        it("Should create a TS Controller by setting type", done => 
        {
            CLI.retrieveMessages()
                .exec([
                    "mvc:controller:create",
                    "ExampleController",
                    "--type=ts",
                ])
                .then(() => expect(existsSync("ExampleController.ts")).to.be.true)
                .then(() => done());
        });

        it("Should present error when file type is not allowed", done => 
        {
            CLI.retrieveMessages()
                .exec([
                    "mvc:controller:create",
                    "ExampleController",
                    "--type=jsx",
                ])
                .then(scope => scope.retrieve())
                .then(response =>
                    expect(response).to.have.property("file type"))
                .then(() => done());
        });

        afterEach(() => 
        {
            if (existsSync("ExampleController.js"))
                unlinkSync("ExampleController.js");

            if (existsSync("ExampleController.ts"))
                unlinkSync("ExampleController.ts");
        });
    });
});
