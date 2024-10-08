import { STYLES } from '@/constants/STYLES';
import * as React from 'react';
import { TextInput } from 'react-native-paper';

const LoginInput = () => {
    const [text, setText] = React.useState("");

    return (
        <TextInput
            style={STYLES.textInput}
            label="Email"
            value={text}
            onChangeText={text => setText(text)}
        />
    );
};

export default LoginInput;