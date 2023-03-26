const { toSnakeCase, toCamelCase } = require("../../src/utils");

describe("Test camel case to snake case converter", () => {
    it("should convert simple object from camel to snake case", async () => {
        // given
        const expectedSnakeAccountId = "account_id";
        const expectedSnakeTotalAmount = "total_amount";
        const expectedSnakeSellingLines = "selling_lines";

        const camelObj = {
            accountId: "1",
            totalAmount: 99,
            sellingLines: [1, 2, 3],
        };

        // when
        const result = toSnakeCase(camelObj);

        // then
        expect(result[expectedSnakeAccountId]).toBe("1");
        expect(result[expectedSnakeTotalAmount]).toBe(99);
        expect(result[expectedSnakeSellingLines].length).toBe(3);
        expect(result[expectedSnakeSellingLines][2]).toBe(3);
    });

    it("should convert object with nested objects from camel to snake case", async () => {
        // given
        const expectedSnakeUserDetails = "user_details";
        const expectedSnakeEmailAddress = "email_address";
        const expectedSnakePersonalInterest = "personal_interest";
        const expectedSnakeDOB = "date_of_birth";

        const camelObj = {
            accountId: "1",
            totalAmount: 99,
            sellingLines: [1, 2, 3],
            userDetails: {
                emailAddress: "test@test.com",
                personalInterest: ["sport", "music"],
                personal: {
                    city: "Rome",
                    dateOfBirth: "1992-07-21",
                },
            },
        };

        // when
        const result = toSnakeCase(camelObj);

        // then
        expect(result[expectedSnakeUserDetails]).toBeDefined();
        expect(result[expectedSnakeUserDetails][expectedSnakeEmailAddress]).toBe("test@test.com");
        expect(result[expectedSnakeUserDetails][expectedSnakePersonalInterest]).toBeDefined();
        expect(result[expectedSnakeUserDetails][expectedSnakePersonalInterest].length).toBe(2);
        expect(result[expectedSnakeUserDetails][expectedSnakePersonalInterest][0]).toBe("sport");
        expect(result[expectedSnakeUserDetails].personal[expectedSnakeDOB]).toBeDefined();
        expect(result[expectedSnakeUserDetails].personal[expectedSnakeDOB]).toBe("1992-07-21");
    });

    it("should convert object with nested objects from camel to snake case", async () => {
        // given
        const expectedSnakeUserDetails = "user_details";
        const expectedSnakeLanguageList = "language_list";
        const expectedSnakeLanguageName = "language_name";

        const camelObj = getCamelCaseObject();

        // when
        //console.log(util.inspect(camelObj, { depth: null }));
        const result = toSnakeCase(camelObj);
        //console.log(util.inspect(result, { depth: null }));

        // then
        expect(result[expectedSnakeUserDetails]).toBeDefined();
        expect(result[expectedSnakeUserDetails][expectedSnakeLanguageList].length).toBe(4);
        expect(result.user_details.language_list[0][expectedSnakeLanguageName]).toBe("english");
        expect(result.user_details.language_list[1][expectedSnakeLanguageName]).toBe("spanish");
        expect(result.user_details.language_list[2]).toBe("test-string");
        expect(result.user_details.language_list[3]).toBe(101);
        expect(result.user_details.language_list[0].nested_list[0].this_is_very_nested).toBeTruthy();
    });

    it("should convert array with nested mixed elements from camel to snake case", async () => {
        // given
        camelArray = getCamelCaseArray();

        // when
        //console.log(util.inspect(camelArray, { depth: null }));
        const result = toSnakeCase(camelArray);
        //console.log(util.inspect(result, { depth: null }));

        // then
        expect(result[0].date_of_birth).toBe("1992-07-21");
        expect(result[0].nested_one.nested_two).toBeTruthy();
        expect(result[0].nested_one.nested_three[1].nested_four).toBeTruthy();
        expect(result[1].date_of_birth).toBe("1988-05-10");
        expect(result[2]).toBe(200);
        expect(result[3]).toBe("test-string");
        expect(result[4].length).toBe(4);
        expect(result[4][2]).toBe(3);
        expect(result[4][3].nested_obj).toBe("yes");
    });
});

describe("Test camel case to snake case converter", () => {
    it("should convert object with nested objects from snake to camel case", async () => {
        // given
        const camelObj = getCamelCaseObject();
        const snakeObj = toSnakeCase(camelObj);

        // when
        const result = toCamelCase(snakeObj);

        // then
        expect(result).toStrictEqual(camelObj);
    });

    it("should convert array with nested mixed elements from camel to snake case", async () => {
        // given
        const cameArray = getCamelCaseArray();
        const snakeObj = toSnakeCase(cameArray);

        // when
        const result = toCamelCase(snakeObj);

        // then
        expect(result).toStrictEqual(cameArray);
    });
});

const getCamelCaseObject = () => {
    const camelObj = {
        accountId: "1",
        totalAmount: 99,
        sellingLines: [1, 2, 3],
        userDetails: {
            emailAddress: "test@test.com",
            personalInterest: ["sport", "music"],
            personal: {
                city: "Rome",
                dateOfBirth: "1992-07-21",
            },
            languageList: [
                {
                    languageName: "english",
                    score: 8,
                    nestedList: [
                        {
                            thisIsVeryNested: true,
                        },
                    ],
                },
                {
                    languageName: "spanish",
                    score: 6,
                },
                "test-string",
                101,
            ],
        },
    };

    return camelObj;
};

const getCamelCaseArray = () => {
    const camelArray = [
        {
            mainCity: "Rome",
            dateOfBirth: "1992-07-21",
            nestedOne: {
                nestedTwo: true,
                nestedThree: [1, { nestedFour: true }],
            },
        },
        {
            mainCity: "Milan",
            dateOfBirth: "1988-05-10",
            nestedArray: [3, 4, 5],
        },
        200,
        "test-string",
        [1, 2, 3, { nestedObj: "yes" }],
    ];

    return camelArray;
};
