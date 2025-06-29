import { StyleSheet } from 'react-native';

import Home from "@/src/app/home/index";

export default function TabOneScreen() {
  return (
    <Home/>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
