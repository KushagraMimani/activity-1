import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createBottomTabNavigator} from 'react-navigation-tabs'

import TransactionScreen from './screens/BookTransactionScreen';
import SearchScreen from './screens/SearchScreen';

export default class App extends React.Component {
  render(){
    return (
      <AppContainer/>
    );
  }
}

const TabNavigator = createBottomTabNavigator({
  Transaction:{screen:TransactionScreen},
  Search:{screen:SearchScreen}
},{
  defaultNavigationOptions:({navigation})=>({
    tabBarIcon:({})=>{
      const routeName = navigation.state.routeName;

      if (routeName === 'Transaction') {
        return(<Image style={{width:30, height:30}} source={require('./assets/book.png')}/>)
      }else if(routeName === 'Search'){
        return(<Image style={{width:30, height:30}} source={require('./assets/searchingbook.png')}/>)
      }
    }
  })
});

const AppContainer = createAppContainer(TabNavigator);