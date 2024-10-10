import { SnackbarContext } from "@/context/SnackbarContext";
import { useContext } from "react";

export const useSnackbar = () => useContext(SnackbarContext);