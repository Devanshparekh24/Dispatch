import { View, Text } from 'react-native'

const Card = ({
    className = '',
    style,
    children
}) => {
    return (
        <View className={`bg-secondary-50 rounded-2xl p-4 shadow-md ${className}`} style={style} >
            {children}
        </View>
    )
}

export default Card