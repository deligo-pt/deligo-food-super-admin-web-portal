

type TFunction = (key: string) => string;

const SORT_OPTIONS = {
    newest: {
        label: "newest_first",
        value: "-createdAt",
    },
    oldest: {
        label: "oldest_first",
        value: "createdAt",
    },
    nameAZ: {
        label: "name_a_z",
        value: "name.firstName",
    },
    nameZA: {
        label: "name_z_a",
        value: "-name.lastName",
    },
    priceHL: {
        label: "price_high_low",
        value: "-pricing.finalPrice",
    },
    priceLH: {
        label: "price_low_high",
        value: "pricing.finalPrice",
    },
    highestRated: {
        label: "highest_rated",
        value: "-rating.average",
    },
    lowestRated: {
        label: "lowest_rated",
        value: "rating.average",
    },
    establishment: {
        label: "establishment_a_z",
        value: "establishmentName",
    },
    taxNameAZ: {
        label: "tax_name_a_z",
        value: "taxName",
    },
    taxNameZA: {
        label: "tax_name_z_a",
        value: "-taxName",
    },
} as const;

export type SortOptionKey = keyof typeof SORT_OPTIONS;

export const getSortOptions = (
    t: TFunction,
    keys: SortOptionKey[]
) => {
    return keys.map((key) => ({
        label: t(SORT_OPTIONS[key].label),
        value: SORT_OPTIONS[key].value,
    }));
};