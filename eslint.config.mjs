import nx from "@nx/eslint-plugin";

export default [
    ...nx.configs["flat/base"],
    ...nx.configs["flat/typescript"],
    ...nx.configs["flat/javascript"],
    {
        ignores: [
            "**/dist",
        ],
    },
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.js",
            "**/*.jsx",
        ],
        rules: {
            "@nx/enforce-module-boundaries": [
                "error",
                {
                    enforceBuildableLibDependency: true,
                    allow: [
                        "^.*/eslint(\\.base)?\\.config\\.[cm]?js$"
                    ],
                    depConstraints: [
                        {
                            sourceTag: "*",
                            onlyDependOnLibsWithTags: ["*"],
                        },
                        {
                            sourceTag: "public",
                            onlyDependOnLibsWithTags: ["public", "shared"], // Пример ограничения для публичных API
                        },
                        {
                            sourceTag: "private",
                            onlyDependOnLibsWithTags: ["private"], // Пример для закрытых частей
                        }
                    ],
                }
            ]
        }
    },
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.cts",
            "**/*.mts",
            "**/*.js",
            "**/*.jsx",
            "**/*.cjs",
            "**/*.mjs",
        ],
        rules: {
            "@typescript-eslint/explicit-module-boundary-types": "warn",
            "@typescript-eslint/no-explicit-any": "warn",
            "react/jsx-uses-react": "off",
            "react/react-in-jsx-scope": "off",
        },
    },
    {
        files: ["**/*.spec.ts", "**/*.spec.tsx", "**/*.test.ts", "**/*.test.tsx"],
        rules: {
            "@jest/consistent-test-it": "error",
            "@jest/prefer-expect-assertions": "warn",
        }
    }
];
