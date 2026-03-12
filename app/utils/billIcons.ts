// Map policy area names to icon filenames
export const BILL_ICON_MAP: { [key: string]: any } = {
  "Agriculture and Food": require("../../assets/bills_icons/agriculture.png"),
  Animals: require("../../assets/bills_icons/animals.png"),
  "Armed Forces and National Security": require("../../assets/bills_icons/armed-forces.png"),
  "Arts, Culture, Religion": require("../../assets/bills_icons/arts.png"),
  "Civil Rights and Liberties, Minority Issues": require("../../assets/bills_icons/civil-rights.png"),
  Commerce: require("../../assets/bills_icons/commerce.png"),
  Congress: require("../../assets/bills_icons/congress.png"),
  "Crime and Law Enforcement": require("../../assets/bills_icons/crime.png"),
  "Economics and Public Finance": require("../../assets/bills_icons/economics.png"),
  Education: require("../../assets/bills_icons/education.png"),
  "Emergency Management": require("../../assets/bills_icons/emergency.png"),
  Energy: require("../../assets/bills_icons/energy.png"),
  "Environmental Protection": require("../../assets/bills_icons/environment.png"),
  Families: require("../../assets/bills_icons/families.png"),
  "Finance and Financial Sector": require("../../assets/bills_icons/finance.png"),
  "Foreign Trade and International Finance": require("../../assets/bills_icons/foreign-trade.png"),
  "Government Operations and Politics": require("../../assets/bills_icons/government.png"),
  Health: require("../../assets/bills_icons/health.png"),
  "Housing and Community Development": require("../../assets/bills_icons/housing.png"),
  Immigration: require("../../assets/bills_icons/immigration.png"),
  "International Affairs": require("../../assets/bills_icons/international.png"),
  "Labor and Employment": require("../../assets/bills_icons/labor.png"),
  Law: require("../../assets/bills_icons/law.png"),
  "Native Americans": require("../../assets/bills_icons/native-americans.png"),
  "Public Lands and Natural Resources": require("../../assets/bills_icons/public-lands.png"),
  "Science, Technology, Communications": require("../../assets/bills_icons/science.png"),
  "Social Welfare": require("../../assets/bills_icons/social-welfare.png"),
  "Sports and Recreation": require("../../assets/bills_icons/sports.png"),
  Taxation: require("../../assets/bills_icons/taxation.png"),
  "Transportation and Public Works": require("../../assets/bills_icons/transportation.png"),
  "Water Resources Development": require("../../assets/bills_icons/water.png"),
  // Add a default fallback
  default: require("../../assets/bills_icons/default.png"),
};

export const getBillIcon = (policyAreaName?: string) => {
  if (!policyAreaName) return BILL_ICON_MAP["default"];
  return BILL_ICON_MAP[policyAreaName] || BILL_ICON_MAP["default"];
};

export const getIconFromActionText = (actionText?: string) => {
  if (!actionText) return BILL_ICON_MAP["default"];

  const text = actionText.toLowerCase();

  // Armed Forces and National Security
  if (
    text.includes("armed forces") ||
    text.includes("armed services") ||
    text.includes("military") ||
    text.includes("defense") ||
    text.includes("veterans") ||
    text.includes("homeland security")
  )
    return BILL_ICON_MAP["Armed Forces and National Security"];

  // Health
  if (
    text.includes("health") ||
    text.includes("medicare") ||
    text.includes("medicaid") ||
    text.includes("medical") ||
    text.includes("hospital") ||
    text.includes("disease")
  )
    return BILL_ICON_MAP["Health"];

  // Education
  if (
    text.includes("education") ||
    text.includes("school") ||
    text.includes("college") ||
    text.includes("student") ||
    text.includes("university") ||
    text.includes("learning")
  )
    return BILL_ICON_MAP["Education"];

  // Agriculture and Food
  if (
    text.includes("agriculture") ||
    text.includes("farming") ||
    text.includes("food") ||
    text.includes("nutrition") ||
    text.includes("rural") ||
    text.includes("usda")
  )
    return BILL_ICON_MAP["Agriculture and Food"];

  // Transportation and Public Works
  if (
    text.includes("transportation") ||
    text.includes("highway") ||
    text.includes("infrastructure") ||
    text.includes("transit") ||
    text.includes("aviation") ||
    text.includes("railroad")
  )
    return BILL_ICON_MAP["Transportation and Public Works"];

  // Energy
  if (
    text.includes("energy") ||
    text.includes("power") ||
    text.includes("electricity") ||
    text.includes("renewable") ||
    text.includes("fossil") ||
    text.includes("nuclear")
  )
    return BILL_ICON_MAP["Energy"];

  // Environmental Protection
  if (
    text.includes("environment") ||
    text.includes("climate") ||
    text.includes("pollution") ||
    text.includes("epa") ||
    text.includes("conservation") ||
    text.includes("wildlife")
  )
    return BILL_ICON_MAP["Environmental Protection"];

  // Finance and Financial Sector
  if (
    text.includes("financial services") ||
    text.includes("banking") ||
    text.includes("securities") ||
    text.includes("finance") ||
    text.includes("credit") ||
    text.includes("investment")
  )
    return BILL_ICON_MAP["Finance and Financial Sector"];

  // Taxation
  if (
    text.includes("tax") ||
    text.includes("revenue") ||
    text.includes("irs") ||
    text.includes("fiscal")
  )
    return BILL_ICON_MAP["Taxation"];

  // Economics and Public Finance
  if (
    text.includes("budget") ||
    text.includes("appropriations") ||
    text.includes("economic") ||
    text.includes("commerce") ||
    text.includes("treasury") ||
    text.includes("spending")
  )
    return BILL_ICON_MAP["Economics and Public Finance"];

  // Judiciary / Law
  if (
    text.includes("judiciary") ||
    text.includes("justice") ||
    text.includes("legal") ||
    text.includes("court") ||
    text.includes("law")
  )
    return BILL_ICON_MAP["Law"];

  // Crime and Law Enforcement
  if (
    text.includes("crime") ||
    text.includes("police") ||
    text.includes("enforcement") ||
    text.includes("prison") ||
    text.includes("criminal") ||
    text.includes("corrections")
  )
    return BILL_ICON_MAP["Crime and Law Enforcement"];

  // Immigration
  if (
    text.includes("immigration") ||
    text.includes("border") ||
    text.includes("citizenship") ||
    text.includes("visa") ||
    text.includes("asylum") ||
    text.includes("homeland")
  )
    return BILL_ICON_MAP["Immigration"];

  // Foreign Trade and International Finance
  if (
    text.includes("foreign") ||
    text.includes("trade") ||
    text.includes("export") ||
    text.includes("import") ||
    text.includes("tariff") ||
    text.includes("international relations")
  )
    return BILL_ICON_MAP["Foreign Trade and International Finance"];

  // International Affairs
  if (
    text.includes("international") ||
    text.includes("foreign affairs") ||
    text.includes("diplomacy") ||
    text.includes("foreign relations") ||
    text.includes("state department")
  )
    return BILL_ICON_MAP["International Affairs"];

  // Labor and Employment
  if (
    text.includes("labor") ||
    text.includes("employment") ||
    text.includes("workforce") ||
    text.includes("worker") ||
    text.includes("pension") ||
    text.includes("wage")
  )
    return BILL_ICON_MAP["Labor and Employment"];

  // Housing and Community Development
  if (
    text.includes("housing") ||
    text.includes("urban") ||
    text.includes("community development") ||
    text.includes("hud") ||
    text.includes("mortgage") ||
    text.includes("real estate")
  )
    return BILL_ICON_MAP["Housing and Community Development"];

  // Science, Technology, Communications
  if (
    text.includes("science") ||
    text.includes("technology") ||
    text.includes("telecommunications") ||
    text.includes("internet") ||
    text.includes("research") ||
    text.includes("innovation") ||
    text.includes("cybersecurity")
  )
    return BILL_ICON_MAP["Science, Technology, Communications"];

  // Government Operations and Politics
  if (
    text.includes("government operations") ||
    text.includes("oversight") ||
    text.includes("reform") ||
    text.includes("government reform") ||
    text.includes("ethics") ||
    text.includes("postal")
  )
    return BILL_ICON_MAP["Government Operations and Politics"];

  // Civil Rights and Liberties
  if (
    text.includes("civil rights") ||
    text.includes("civil liberties") ||
    text.includes("voting rights") ||
    text.includes("discrimination") ||
    text.includes("equality")
  )
    return BILL_ICON_MAP["Civil Rights and Liberties, Minority Issues"];

  // Native Americans
  if (
    text.includes("native american") ||
    text.includes("indian affairs") ||
    text.includes("tribal") ||
    text.includes("indigenous")
  )
    return BILL_ICON_MAP["Native Americans"];

  // Public Lands and Natural Resources
  if (
    text.includes("public lands") ||
    text.includes("natural resources") ||
    text.includes("interior") ||
    text.includes("parks") ||
    text.includes("forestry") ||
    text.includes("mining")
  )
    return BILL_ICON_MAP["Public Lands and Natural Resources"];

  // Water Resources Development
  if (
    text.includes("water") ||
    text.includes("irrigation") ||
    text.includes("flood") ||
    text.includes("dam") ||
    text.includes("waterway")
  )
    return BILL_ICON_MAP["Water Resources Development"];

  // Social Welfare
  if (
    text.includes("social services") ||
    text.includes("welfare") ||
    text.includes("poverty") ||
    text.includes("assistance") ||
    text.includes("social security")
  )
    return BILL_ICON_MAP["Social Welfare"];

  // Emergency Management
  if (
    text.includes("emergency") ||
    text.includes("disaster") ||
    text.includes("fema") ||
    text.includes("relief")
  )
    return BILL_ICON_MAP["Emergency Management"];

  // Commerce
  if (
    text.includes("commerce") ||
    text.includes("business") ||
    text.includes("small business") ||
    text.includes("entrepreneurship")
  )
    return BILL_ICON_MAP["Commerce"];

  // Sports and Recreation
  if (
    text.includes("sports") ||
    text.includes("recreation") ||
    text.includes("olympics") ||
    text.includes("athletic")
  )
    return BILL_ICON_MAP["Sports and Recreation"];

  // Arts, Culture, Religion
  if (
    text.includes("arts") ||
    text.includes("culture") ||
    text.includes("humanities") ||
    text.includes("museum") ||
    text.includes("religion")
  )
    return BILL_ICON_MAP["Arts, Culture, Religion"];

  // Families
  if (
    text.includes("family") ||
    text.includes("children") ||
    text.includes("child") ||
    text.includes("parental")
  )
    return BILL_ICON_MAP["Families"];

  // Congress (for internal congressional procedures)
  if (
    text.includes("rules") ||
    text.includes("house administration") ||
    text.includes("congressional") ||
    text.includes("senate rules")
  )
    return BILL_ICON_MAP["Congress"];

  return BILL_ICON_MAP["default"];
};
