import { unlinkSync, existsSync } from "fs";
import { expect } from "chai";
import { CLI } from "./../../../bin/forklift";

describe("Unit/MVC/EntityTest", () => 
{
    describe("MVC:Entity:Create", () => 
    {
        it("Should create a JS Entity", done => 
        {
            CLI.retrieveMessages()
                .exec(["mvc:entity:create", "ExampleEntity.js", "-v"])
                .then(() => expect(existsSync("ExampleEntity.js")).to.be.true)
                .then(() => done());
        });

        it("Should create a JS Entity without set type", done => 
        {
            CLI.retrieveMessages()
                .exec(["mvc:entity:create", "ExampleEntity", "-v"])
                .then(() => expect(existsSync("ExampleEntity.js")).to.be.true)
                .then(() => done());
        });

        it("Should create a TS Entity", done => 
        {
            CLI.retrieveMessages()
                .exec(["mvc:entity:create", "ExampleEntity", "--type=ts"])
                .then(() => expect(existsSync("ExampleEntity.ts")).to.be.true)
                .then(() => done());
        });

        it("Should present error when file type not allowed", done => 
        {
            CLI.retrieveMessages()
                .exec(["mvc:entity:create", "ExampleEntity", "--type=xs"])
                .then(scope => scope.retrieve())
                .then(response =>
                    expect(response).to.have.property("file type"))
                .then(() => done());
        });

        afterEach(() => 
        {
            if (existsSync("ExampleEntity.js")) unlinkSync("ExampleEntity.js");

            if (existsSync("ExampleEntity.ts")) unlinkSync("ExampleEntity.ts");
        });
    });
});
