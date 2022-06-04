const { toSnakeCase } = require("../src/utils");

describe("Test snake camel case converter", () => {
    it("should convert simple object from camel to snake", async () => {
        // given
        const expectedSnakeAccountId = "account_id";
        const expectedSnakeTotalAmount = "total_amount";
        const expectedSnakeSellingLines = "selling_lines";

        const underTest = {
            accountId: "1",
            totalAmount: 99,
            sellingLines: ["1", "2", "3"],
        };

        // when
        const result = toSnakeCase(underTest);

        // then
        expect(result[expectedSnakeAccountId]).toBe("1");
        expect(result[expectedSnakeTotalAmount]).toBe(99);
        expect(result[expectedSnakeSellingLines].length).toBe(3);
        expect(result[expectedSnakeSellingLines][2]).toBe("3");
    });

    it("should convert object with nested objects from camel to snake", async () => {
        // given
        const expectedSnakeUserDetails = "user_details";
        const expectedSnakeEmailAddress = "email_address";
        const expectedSnakePersonalInterest = "personal_interest";
        const expectedSnakeDOB = "date_of_birth";

        const underTest = {
            accountId: "1",
            totalAmount: 99,
            userDetails: {
                emailAddress: "test@test.com",
                personalInterest: ["sport", "music"],
                sellingLines: ["1", "2", "3"],
                personal: {
                    city: "Rome",
                    dateOfBirth: "1992-07-21"
                }
            },
        };

        // when
        const result = toSnakeCase(underTest);

        // then
        expect(result[expectedSnakeUserDetails]).toBeDefined()
        expect(result[expectedSnakeUserDetails][expectedSnakeEmailAddress]).toBe("test@test.com");
        expect(result[expectedSnakeUserDetails][expectedSnakePersonalInterest]).toBeDefined();
        expect(result[expectedSnakeUserDetails][expectedSnakePersonalInterest].length).toBe(2);
        expect(result[expectedSnakeUserDetails][expectedSnakePersonalInterest][0]).toBe("sport");
        expect(result[expectedSnakeUserDetails].personal[expectedSnakeDOB]).toBeDefined();
        expect(result[expectedSnakeUserDetails].personal[expectedSnakeDOB]).toBe("1992-07-21");
    });

    it("should convert object with nested objects from camel to snake", async () => {
        // given
        const underTest = {
            accountId: "1",
            totalAmount: 99,
            userDetails: {
                emailAddress: "test@test.com",
                personalInterest: ["sport", "music"],
                sellingLines: ["1", "2", "3"],
                personal: {
                    city: "Rome",
                    dateOfBirth: "1992-07-21"
                },
                languageList: [
                    {
                        languageName: "english",
                        score: 8
                    },
                    {
                        languageName: "spanish",
                        score: 6
                    }
                ]
            },
        };

        // when
        const result = toSnakeCase(underTest);
        console.log(result.user_details.language_list)

        // then
        
    });
});
