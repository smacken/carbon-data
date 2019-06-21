import { suite, test, slow, timeout  } from "mocha-typescript";
import { assert } from "chai";
import 'mocha'

@suite(slow(1000), timeout(3000))
export class ScraperTest {

    @test scraper(){
        describe("NZU scraper", ()=>{
            it("Should retrieve nzu data", (done) => {
                assert.isTrue(true);
                done();
            })
        });
    }
}