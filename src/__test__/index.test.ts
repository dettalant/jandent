import { addOne } from "#/index";

describe("index", () => {
  it("addOne(1) to return 2", () => {
    expect(addOne(1)).toBe(2);
  })
})
