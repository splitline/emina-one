import { combineReducers } from "redux";
import favorites from "./favorites";
import animeDatas from "./animeDatas";
import history from "./history";

export default combineReducers({ favorites, animeDatas, history });
