
type TFunction = (key: string) => string;

export const getSortOptions = (t: TFunction) => {
    return [
        { label: t("newest_first"), value: "-createdAt" },
        { label: t("oldest_first"), value: "createdAt" },
        { label: t("name_a_z"), value: "name.firstName" },
        { label: t("name_z_a"), value: "-name.lastName" },
    ];
};
