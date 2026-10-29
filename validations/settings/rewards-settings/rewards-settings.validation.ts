import z from "zod";

const points = (label: string) =>
  z
    .number(`${label} must be a number`)
    .nonnegative(`${label} must be at least 0`);

const perRole = (label: string) =>
  z.object({
    customer: points(`Customer ${label}`),
    rider: points(`Rider ${label}`),
    vendor: points(`Vendor ${label}`),
  });

export const RewardsSettingsSchema = z.object({
  customerOrderPoints: points("Customer order points"),
  riderDeliveryPoints: points("Rider delivery points"),
  vendorOrderPoints: points("Vendor order points"),
  referralPoints: perRole("referral points"),
  welcomeBonus: perRole("welcome bonus"),
  pointsExpiryDays: points("Points expiry days"),
  maxRewardClaimsPerYear: z
    .number("Max reward claims per year must be a number")
    .int("Max reward claims per year must be a whole number")
    .nonnegative("Max reward claims per year must be at least 0"),
});


// import z from "zod";

// const referralMilestoneSchema = z.object({
//   friendsRequired: z.number().positive("Friends required must be > 0"),
//   rewardType: z.enum(["CASHBACK", "FREE_MEAL", "FREE_DELIVERY", "CREDIT"]),
//   rewardValue: z.number().nonnegative("Reward value must be >= 0"),
//   minOrderAmountPerFriend: z
//     .number()
//     .nonnegative("Min order amount must be >= 0"),
// });

// export const RewardsSettingsSchema = z.object({
//   customerPointsPerEuro: z
//     .number("Customer points per euro must be a number")
//     .nonnegative("Customer points per euro must be at least 0"),
//   riderPointsPerDelivery: z
//     .number("Rider points per delivery must be a number")
//     .nonnegative("Rider points per delivery must be at least 0"),
//   referralPoints: z
//     .number("Referral points must be a number")
//     .nonnegative("Referral points must be at least 0"),
//   newRiderWelcomeBonus: z
//     .number("New rider welcome bonus must be a number")
//     .nonnegative("New rider welcome bonus must be at least 0"),
//   pointsExpiryDays: z
//     .number("Points expiry days must be a number")
//     .nonnegative("Points expiry days must be at least 0"),
//   customerReferralMilestones: z.array(referralMilestoneSchema),
// });
