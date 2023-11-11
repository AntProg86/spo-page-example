import { ApplicationState } from "#/src-ie-module/types";
import { useSelector } from "react-redux";

export const preFill = () => {

  const testStore = useSelector<ApplicationState, any>((state) => state.application.userInfo);
  console.log('*-*-*-*-preFill');
  console.log(testStore);
  
  
}