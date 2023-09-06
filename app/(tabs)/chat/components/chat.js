import { globalColors, globalStyles } from '../../../../globalDesign';
import { StyleSheet, View, Text } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LoadingIndicator from '../../../../components/loadingIndicator'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import { errorToast } from '../../../../utilities'
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../../supabaseConnect';

// real-time chat component
const Chat = ({ matchID, activated, userID, other }) => {
  // chat state
  const [messages, setMessages] = useState([]);

  // screen state
  const [isLoading, setIsLoading] = useState(true);

  // grabs and listens for new messages from chat db, and sets messages state
  useEffect(() => {
    // grabs chat messages from db and sets messages state
    (async () => {
      const { data, error } = await supabase.from('messages').select().eq('match_id', matchID).order('created_at',{ascending: false});
      if (data) {
          const msgs = [];
          // sorts messages by sender
          data.map(message => {
              if (message.user === userID) {
                  msgs.push(
                      {
                      _id: message.id,
                      createdAt: message.created_at,
                      text: message.message,
                      user: {_id: userID}
                      }
                  )
              } else {
                  msgs.push(
                      {
                      _id: message.id,
                      createdAt: message.created_at,
                      text: message.message,
                      user: {
                        _id: other.ID,
                        name: other.full_name,
                        avatar: other.avatar,
                      }
                      }
                  )
              }
          })
          setMessages(msgs);
          setIsLoading(false);
      } else if (error) {
          errorToast(error.message);
      }
    })()

    // listens to changes in chat db from other and adds new entries to messages state
    supabase
    .channel('chat_changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchID}`
      },
      (payload) => {
        if (payload.new.user !== userID) {
          const newMsg = {
            _id: payload.new.id,
            createdAt: payload.new.created_at,
            text: payload.new.message,
            user: {
              _id: other.ID,
              name: other.full_name,
              avatar: other.avatar,
            }  
          }
          setMessages(previousMessages => GiftedChat.append(previousMessages, newMsg));
        }
      }
    )
    .subscribe()
  },[])

  // handles sent messages
  // updates messages state, inserts message in chat db, and activates matches in db
  const onSend = useCallback((messages = []) => {
    (async () => {
      // updates messages state
      setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
      
      // inserts message in chat db
      const { createdAt, text } = messages[0];
      const { error } = await supabase.from('messages').insert({ created_at: createdAt, match_id: matchID, user: userID, message: text});
      if (error) {
        errorToast(error.message);
      } else {
        // updates activation in chat db if not already activated
        if (activated === 'false') {
            const { error } = await supabase.from('matches').update({activated: true}).eq('id', matchID);
            if (error) {
              errorToast(error.message);
            }
        }
      }
    })()
  },[])
  
return (
  <>
  {/* displays banner if no messages */}
  {(messages.length < 1) && 
  <View style={styles.newMatchBox}>
      <Text style={{...globalStyles.fontMediumBold, color: 'white'}}>Message your new match!</Text>
  </View>
  }
  {/* chat */}
  <GiftedChat
      isKeyboardInternallyHandled={false}
      // minInputToolbarHeight={0}
      keyboardShouldPersistTaps='never'
      messages={messages}
      onSend={messages => onSend(messages)}
      renderBubble={props => {
          return (
            <Bubble
              {...props}
              wrapperStyle={{
                left: {
                  backgroundColor: 'white',
                },
                right: {
                  backgroundColor: globalColors.secondary,
                },
              }}
            />
          );
        }}  
      user={{
          _id: userID,
      }} 
  />
  <KeyboardSpacer/>
  </>
)
}

const styles = StyleSheet.create({
  newMatchBox: {
      ...globalStyles.boxShadows,
      marginTop: 10,
      marginBottom: 20,
      paddingVertical: 20,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: globalColors.secondary,
      width: '100%'
  }
})

export default Chat;