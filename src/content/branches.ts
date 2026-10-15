// The two Yanks and Brits offices. Shown in the footer, on the Contact page, in About, and in search-engine data.

export type Branch = {
  name: string;
  /** The address as written on signage and documents. */
  address: string;
  street: string;
  locality: string;
  postalCode: string;
};

export const branches: Branch[] = [
  {
    name: "Main branch",
    address: "Jln. Labu No. 1, Petisah Hulu, Medan Baru, Sumatera Utara 20153",
    street: "Jln. Labu No. 1, Petisah Hulu, Medan Baru",
    locality: "Medan",
    postalCode: "20153",
  },
  {
    name: "Cemara Asri branch",
    address: "Komplek Cemara Asri, Ruko CKM Jln. Boulevard Timur 88PP, Kab. Deli Serdang, Sumatera Utara 20371",
    street: "Komplek Cemara Asri, Ruko CKM Jln. Boulevard Timur 88PP",
    locality: "Kab. Deli Serdang",
    postalCode: "20371",
  },
];

/** Opens the address in Google Maps (app on phones, web elsewhere). */
export const mapsHref = (branch: Branch) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address)}`;

/** Both branches keep the same hours (WIB, UTC+7). Closed on Sundays. */
export const openingHours = [
  { days: "Monday - Friday", opens: "09:00", closes: "20:00", schemaDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] },
  { days: "Saturday", opens: "09:00", closes: "15:00", schemaDays: ["Saturday"] },
];
