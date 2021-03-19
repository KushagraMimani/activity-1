import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ToastAndroid, KeyboardAvoidingView, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';

import firebase from 'firebase';
import db from '../config';

export default class TransactionScreen extends React.Component {
    constructor(){
        super();
        this.state={
            hasCameraPremissions:null,
            scanned:false,
            scanBookId:'',
            scanStudentId:'',
            buttonState:'normal',
            transactionMessage:'',
        }
    }

    getCameraPermissions=async(id)=>{
        const { status }= await Permissions.askAsync(Permissions.CAMERA)
        this.setState({
            hasCameraPremissions:status === 'granted',
            buttonState:id,
            scanned:false,
        })
    }

    handleBarCodeScan=async({type,data})=>{

        const { buttonState } = this.state;
        if (buttonState === 'BookId') {
            this.setState({
                scanned:true,
                scanBookId:data,
                buttonState:'normal',
            })
        }else if(buttonState === 'StudentId'){
            this.setState({
                scanned:true,
                scanStudentId:data,
                buttonState:'normal',
            })
        }
    }

    handleTransaction=async()=>{
        var transactionType = await this.checkBookEligibility();

        if (!transactionType) {
            Alert.alert("The book doesn't exist in the library.")
            this.setState({
                scanStudentId:'',
                scanBookId:'',
            })
        } else if(transactionType === 'issue'){
            var isStudentEligible = await this.checkStudentEligibilityForBookIssue();
             if (isStudentEligible) {
                 this.initiateBookIssue();
                 Alert.alert('Book Issued to the student.')
             }
        } else {
            var isStudentEligible = await this.checkStudentEligibilityForBookReturn();
             if (isStudentEligible) {
                 this.initiateBookReturn();
                 Alert.alert('Book Returned to the library.')
             }
        }
    }

    checkBookEligibility=async()=>{
        const bookRef = await db.collection('books').where('bookId', '==', this.state.scanBookId).get()
        var transactionType = ''
        if (bookRef.docs.length == 0) {
            transactionType = false
            console.log(bookRef.docs.length)
        }else{
            bookRef.docs.map(doc=>{
                var book = doc.data()
                if (book.bookAvailability) {
                    transactionType='issue'
                }else{
                    transactionType='return'
                }
            })
        }
        return transactionType;
    }

    checkStudentEligibilityForBookIssue=async()=>{
        const studentRef = await db.collection('students').where('studentId', '==', this.state.scanStudentId).get()
        var isStudentEligible = '';
        if (studentRef.docs.length == 0) {
            this.setState({
                scanStudentId:'',
                scanBookId:'',
            })
            isStudentEligible = false
            Alert.alert("Student Id doesn't Exist in the database.")
        }else{
            studentRef.docs.map(doc=>{
                var student = doc.data()
                if (student.numberOfBooksIssued < 2) {
                    isStudentEligible=true
                }else{
                    isStudentEligible=false;
                    Alert.alert("The student has already issued 2 books.")
                    this.setState({
                        scanStudentId:'',
                        scanBookId:'',
                    })
                }
            })
        }
        return isStudentEligible;
    }

    checkStudentEligibilityForBookReturn=async()=>{
        const transactionRef = await db.collection('transactions').where('bookId', '==', this.state.scanBookId).limit(1).get()
        var isStudentEligible = '';
        
        transactionRef.docs.map(doc=>{
                var lastBookTransaction = doc.data()
                if (lastBookTransaction.studentId === this.state.scanStudentId) {
                    isStudentEligible=true
                }else{
                    isStudentEligible=false;
                    Alert.alert("The book wasn't issued to the student.")
                    this.setState({
                        scanStudentId:'',
                        scanBookId:'',
                    })
                }
            })
        
        return isStudentEligible;
    }
    

    // handleTransaction=async()=>{
    //     var transactionMessage = '';

    //     db.collection('books').doc(this.state.scanBookId).get()
    //     .then(doc=>{
    //         var book = doc.data()
    //         console.log(book)

    //         if (book.bookAvailability) {
    //             this.initiateBookIssue()
    //             transactionMessage='Book Issued!'
    //             ToastAndroid.show(transactionMessage, ToastAndroid.LONG);
    //         }else{
    //             this.initiateBookReturn()
    //             transactionMessage='Book Returned!'
    //             ToastAndroid.show(transactionMessage, ToastAndroid.LONG);
    //         }
    //     })
    //     this.setState({
    //         transactionMessage:transactionMessage
    //     })
        
    // }

    initiateBookIssue=async()=>{
        db.collection('transactions').add({
            studentId:this.state.scanStudentId,
            bookId:this.state.scanBookId,
            date:firebase.firestore.Timestamp.now().toDate(),
            transactionType:'issue',
        })
        db.collection('books').doc(this.state.scanBookId).update({
            bookAvailability:false,
        })

        db.collection('students').doc(this.state.scanStudentId).update({
            numberOfBooksIssued:firebase.firestore.FieldValue.increment(1)
        })
    }

    initiateBookReturn=async()=>{
        db.collection('transactions').add({
            studentId:this.state.scanStudentId,
            bookId:this.state.scanBookId,
            date:firebase.firestore.Timestamp.now().toDate(),
            transactionType:'return',
        })
        db.collection('books').doc(this.state.scanBookId).update({
            bookAvailability:true,
        })

        db.collection('students').doc(this.state.scanStudentId).update({
            numberOfBooksIssued:firebase.firestore.FieldValue.increment(-1)
        })
        this.setState({
            scanBookId:'',
            scanStudentId:'',
        })
    }

    render(){
        const hasCameraPremissions=this.state.hasCameraPremissions;
        const scanned = this.state.scanned;
        const buttonState = this.state.buttonState;

        if(buttonState !== 'normal' && hasCameraPremissions){
            return(<BarCodeScanner onBarCodeScanned={scanned?undefined:this.handleBarCodeScan} style={StyleSheet.absoluteFillObject}/>)
        }else if(buttonState==='normal'){
            return(
                <KeyboardAvoidingView style={styles.container} behavior='padding' enabled>
                    
                    <View>
                    <Image style={{width:150, height:150}}source={require('../assets/booklogo.jpg')}/>
                    <Text style={{textAlign:'center', fontSize:30}}>Wily</Text>
                    </View>

                    <Text styles={styles.displayText}>
                        {hasCameraPremissions === true ? this.state.scandata : 'Request Camera Permission'}
                    </Text>

                    <View style={styles.inputView}>
                        <TextInput style={styles.inputBox} placeholder='Book ID' value={this.state.scanBookId} onChangeText={text=>this.setState({
                            scanBookId:text
                        })}></TextInput>
                        <TouchableOpacity style={styles.scanButton} onPress={()=>this.getCameraPermissions("BookId")}>
                        <Text style={styles.buttonText}>Scan</Text>
                    </TouchableOpacity>
                    </View>
                    <View style={styles.inputView}>
                    <TextInput style={styles.inputBox} placeholder='Student ID' value={this.state.scanStudentId} onChangeText={text=>this.setState({
                        scanStudentId:text
                    })}></TextInput>
                    <TouchableOpacity style={styles.scanButton} onPress={()=>this.getCameraPermissions ("StudentId")}>
                        <Text style={styles.buttonText}>Scan</Text>
                    </TouchableOpacity>
                    </View>
                    <Text style={styles.displayText}>{this.state.transactionMessage}</Text>
                    <TouchableOpacity
                        style={styles.submitButton}
                            onPress={async()=>{
                        var transactionMessage = await this.handleTransaction();
                    }}>
                    <Text style={styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>

                </KeyboardAvoidingView>
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitButton:{
        backgroundColor: '#FBC02D',
        width: 100,
        height:50
      },
      submitButtonText:{
        padding: 10,
        textAlign: 'center',
        fontSize: 20,
        fontWeight:"bold",
        color: 'white'
      }
  });