import React from "react"; // ✅ ADD THIS
import { Image, Text, View } from "react-native";
import { styles } from "../styles"; // ✅ ADD THIS (your styles)

export type Bill = {
  // ✅ Export for main screen use
  id: string;
  name: string;
  date: string;
  committee: string;
  update?: string; // ✅ Make optional (matches your ternary)
  icon: any;
};

interface BillCardProps {
  // ✅ Better prop interface
  item: Bill;
}

const BillCard = (
  { item }: BillCardProps, // ✅ Use interface
) => (
  <View style={styles.billCard}>
    <Image source={item.icon} style={styles.billIcon} />
    <View style={styles.billInfo}>
      <Text style={styles.billNumber}>{item.name}</Text>
      <View style={styles.billStatusRow}>
        <Text style={styles.billTitle}>{item.date}</Text>
        <Text style={styles.separator}>·</Text>
        <Text style={styles.billTitle}>{item.committee}</Text>
        {item.update ? (
          <>
            <Text style={styles.separator}>·</Text>
            <Text style={styles.update}>{item.update}</Text>
          </>
        ) : null}
      </View>
    </View>
  </View>
);

export default BillCard; // ✅ Export default
