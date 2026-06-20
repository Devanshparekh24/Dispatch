import { View, Text } from 'react-native'

const Card = ({
    className = '',
    children
}) => {
    return (
        <View className={`bg-green-700 rounded-2xl p-4 shadow-md elevation-2 ${className}`} >
            {children}
        </View>
    )
}

export default Card