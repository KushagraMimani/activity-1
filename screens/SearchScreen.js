import React from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Touchable } from 'react-native';

import db from '../config';
import firebase from 'firebase';

export default class SearchScreen extends React.Component {
    constructor(props){
        super(props);
        this.state={
            allTransactions:[],
            lastVisibleTransaction:'',
        }
    }

    componentDidMount=async()=>{
        const query = await db.collection('transactions').get()
        query.docs.map(doc=>{
            this.setState({
                allTransactions:[...this.state.allTransactions,doc.data()]
            })
        })
    }

    fetchMoreTransactions=async()=>{
        var text = this.state.search.toLowerCase()
        var enterText = text.split('')
        if (enterText[0].toLowerCase()==='b') {
            const transaction = await db.collection('transactions').where('bookId','==',text)
            .startAfter(this.state.lastVisibleTransaction).limit(10).get()
    
            transaction.docs.map(doc=>{
                this.setState({
                    allTransactions:[...this.state.allTransactions,doc.data()],
                    lastVisibleTransaction:doc,
                })
            }) 
        }else if(enterText[0].toLowerCase()==='s') {
            const transaction = await db.collection('transactions').where('studentId','==',text)
            .startAfter(this.state.lastVisibleTransaction).limit(10).get()
    
            transaction.docs.map(doc=>{
                this.setState({
                    allTransactions:[...this.state.allTransactions,doc.data()],
                    lastVisibleTransaction:doc,
                })
            }) 
        }
    }

    searchTransactions=async(text)=>{
        var enterText = text.split('')
        var text = text.toLowerCase()
        if (enterText[0].toLowerCase()==='b') {
            const transaction = await db.collection('transactions').where('bookId','==',text).get()
    
            transaction.docs.map(doc=>{
                this.setState({
                    allTransactions:[...this.state.allTransactions,doc.data()],
                    lastVisibleTransaction:doc,
                })
            }) 
        }else if(enterText[0].toLowerCase()==='s') {
            const transaction = await db.collection('transactions').where('studentId','==',text).get()
    
            transaction.docs.map(doc=>{
                this.setState({
                    allTransactions:[...this.state.allTransactions,doc.data()],
                    lastVisibleTransaction:doc,
                })
            }) 
        }
    }

    render(){
        return(
            <View style={styles.container}>
                <View style={styles.searchBar}>
                    <TextInput style={styles.bar}
                        placeholder='Enter Book Id OR Student Id'
                        onChangeText={text=>this.setState({
                            search:text,
                        })}
                    />
                    <TouchableOpacity style={styles.searchButton} onPress={()=>this.searchTransactions}>
                        <Text>Search</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                data = {this.state.allTransactions}
                renderItem = {({item})=>(
                 <View style={{borderBottomWidth:2}}>
                    <Text>
                        {'Book Id: '+ item.bookId}
                    </Text>
                    <Text>
                        {'Student Id: '+ item.studentId}
                    </Text>
                    <Text>
                        {'Transaction Type: '+ item.transactionType}
                    </Text>
                    <Text>
                        {'Date: '+ item.date}
                    </Text>
                 </View>   
                )}
                onEndReached = {this.fetchMoreTransactions}
                onEndThreshold = {0.7} 
                keyExtractor = {(item,index)=>index.toString()}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 20
    },
    searchBar:{
      flexDirection:'row',
      height:40,
      width:'auto',
      borderWidth:0.5,
      alignItems:'center',
      backgroundColor:'grey',
  
    },
    bar:{
      borderWidth:2,
      height:30,
      width:300,
      paddingLeft:10,
    },
    searchButton:{
      borderWidth:1,
      height:30,
      width:50,
      alignItems:'center',
      justifyContent:'center',
      backgroundColor:'green'
    }
  })