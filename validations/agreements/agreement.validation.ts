// validations/agreements/agreement.validation.ts
import z from "zod";

export type AgreementRole = "VENDOR" | "FLEET_MANAGER"; // extend as needed

export const getUserAgreementSchema = (role: AgreementRole) => {
    const base = z.object({
        signatoryType: z.enum(["SELF", "AUTHORIZED_REPRESENTATIVE"], {
            message: "Signatory type is required",
        }),
        partyRepresentativeName: z.string().optional(),
        partyRepresentativeRole: z.string().optional(),
    });

    // Name is required for AUTHORIZED_REPRESENTATIVE (all roles)
    const withName = base.refine(
        (data) => {
            if (data.signatoryType === "AUTHORIZED_REPRESENTATIVE") {
                return (
                    !!data.partyRepresentativeName &&
                    data.partyRepresentativeName.trim().length > 0
                );
            }
            return true;
        },
        {
            message: "Representative name is required for authorized representatives",
            path: ["partyRepresentativeName"],
        }
    );

    // Role is only required for VENDOR
    if (role === "VENDOR") {
        return withName.refine(
            (data) => {
                if (data.signatoryType === "AUTHORIZED_REPRESENTATIVE") {
                    return (
                        !!data.partyRepresentativeRole &&
                        data.partyRepresentativeRole.trim().length > 0
                    );
                }
                return true;
            },
            {
                message: "Representative role is required for authorized representatives",
                path: ["partyRepresentativeRole"],
            }
        );
    }

    // FLEET_MANAGER (and future roles that don't need partyRole)
    return withName;
};

export type TUserAgreementForm = z.infer<
    ReturnType<typeof getUserAgreementSchema>
>;

/** Maps role → agreementType for the API payload */
export const AGREEMENT_TYPE_BY_ROLE: Record<AgreementRole, string> = {
    VENDOR: "INITIAL_VENDOR_AGREEMENT",
    FLEET_MANAGER: "INITIAL_FLEET_MANAGER_AGREEMENT",
};