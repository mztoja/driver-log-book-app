import { StyleSheet } from "react-native";

export const STYLES = StyleSheet.create({
    mainView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollView: {
        flex: 1,
        width: '100%',
    },
    textInput: {
        marginVertical: 10,
    },
    selectItem: {
        padding: 10,
        fontSize: 18,
        borderBottomWidth: 1,
    },
    modaSelectContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 10,
        justifyContent: 'flex-end',
    },
    modalSelectContainer: {
        flex: 1,
    },
    modalSelectBlackout: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modalFormMainView: {
        borderRadius: 20,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalFormHeader: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    modalFormHeaderBackIcon: {
        position: 'absolute',
        left: 10,
        top: '50%',
        transform: [{ translateY: -12 }],
    },
    inputWrapper: {
        position: 'relative',
        width: '100%',
    },
    iconInputWrapper: {
        position: 'absolute',
        right: 0,
        top: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    separator: {
        borderBottomWidth: 2, // Grubość linii
        borderBottomColor: 'rgba(0, 0, 0, 0.3)', // Kolor linii (zmień według potrzeb)
        width: '100%', // Upewnia się, że linia rozciąga się na całą szerokość
        marginVertical: 10, // Dystans między komponentami
    }
});