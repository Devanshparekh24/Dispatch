import { View, Text } from 'react-native'

const Card = ({
    className = '',
    children
}) => {
    return (
        <View className={`bg-secondary-50 rounded-2xl p-4 shadow-md ${className}`} >
            {children}
        </View>
    )
}

export default Card