import { globalSizes, globalColors } from '../../globalDesign';
import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

const TabsLayout = () => {
    return (
        <Tabs screenOptions={{headerShown: false, tabBarShowLabel: false, tabBarActiveTintColor: globalColors.primary, tabBarInactiveTintColor: globalColors.lightNeutral}}>
            <Tabs.Screen
                name='profile'
                options={{
                    tabBarIcon: ({color}) => (
                        <FontAwesome name='user' size={globalSizes.large} color={color}/>
                    )
                }}
            />
            <Tabs.Screen
                name='swipe'
                options={({ route }) => ({
                    // unmountOnBlur: true, // this recasts the tab each time
                    tabBarStyle: ((route) => {
                      const routeName = getFocusedRouteNameFromRoute(route) ?? ""
                      if (routeName === 'potentialMatch') {
                        return { display: "none" }
                      }
                      return
                    })(route),
                    tabBarIcon: ({color}) => (
                        <FontAwesome name='heart' size={globalSizes.large} color={color}/>
                    ),
                  })}
            />
            <Tabs.Screen
                name='tonight'
                options={{
                    // unmountOnBlur: true, // this recasts the tab each time
                    tabBarIcon: ({color}) => (
                        <FontAwesome name='glass' size={globalSizes.large} color={color}/>
                    )
                }}
            />
            <Tabs.Screen
                name='chat'
                options={({ route }) => ({
                    // unmountOnBlur: true, // this recasts the tab each time
                    tabBarStyle: ((route) => {
                      const routeName = getFocusedRouteNameFromRoute(route) ?? ""
                      if (routeName === 'match' || routeName === 'potentialMatch') {
                        return { display: "none" }
                      }
                      return
                    })(route),
                    tabBarIcon: ({color}) => (
                        <FontAwesome name='comments' size={globalSizes.large} color={color}/>
                    )
                  })}
            />
        </Tabs>
    )
}

export default TabsLayout;