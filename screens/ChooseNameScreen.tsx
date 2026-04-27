import React, { useRef, useState } from 'react';
import {
View,
StyleSheet,
Pressable,
TouchableOpacity,
Animated,
TextInput,
ScrollView,
KeyboardAvoidingView,
Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { colors } from '../constants/colors';
import { Text } from '../components/Text';

type Props={
navigation:NativeStackNavigationProp<RootStackParamList,'ChooseName'>;
}

const SUGGESTED_NAMES=[
'IronPremise',
'CivicWolf',
'DialecticX',
'StoicFire',
'PremisePilot',
'ArenaNomad'
]

const STYLES=[
'Analytical',
'Contrarian',
'Socratic',
'Diplomatic',
'Provocateur'
]

const SIGILS=['🛡','♟','⚖','🔥'];

export default function ChooseNameScreen({navigation}:Props){

const [name,setName]=useState('IronPremise');
const [style,setStyle]=useState('Analytical');
const [sigil,setSigil]=useState('🛡');

const scale=useRef(new Animated.Value(1)).current;

const valid=name.trim().length>=3;

const onContinue=()=>{
if(!valid) return;
navigation.navigate('AllSet')
}

return(
<SafeAreaView style={s.safe} edges={['top','bottom']}>
<StatusBar style='light'/>

<KeyboardAvoidingView
style={{flex:1}}
behavior={Platform.OS==='ios'?'padding':undefined}
>

<View style={s.topBar}>
 <TouchableOpacity
 style={s.backBtn}
 onPress={()=>navigation.goBack()}
 >
  <Text variant='titleLg'>←</Text>
 </TouchableOpacity>

 <View style={s.progressWrap}>
   <View style={[s.progressSeg,s.progressDone]}/>
   <View style={[s.progressSeg,s.progressActive]}/>
   <View style={s.progressSeg}/>
 </View>
</View>

<ScrollView
showsVerticalScrollIndicator={false}
contentContainerStyle={s.scrollContent}
>

<View style={s.hero}>
<Text variant='overline' tone='accent'>STEP 2 OF 3</Text>

<Text variant='displayMd' style={s.headline}>
How should the{`\n`}
arena know you?
</Text>

<Text
variant='bodyLg'
tone='muted'
style={s.subhead}
>
Claim a debating identity.
</Text>
</View>


<View style={s.identityCard}>

<View style={s.identityTop}>
<View style={s.sigilBadge}>
<Text variant='titleLg'>
{sigil}
</Text>
</View>

<View style={{flex:1}}>
<Text variant='titleLg'>Arena Identity</Text>
<Text variant='bodyMd' tone='muted'>Available ✓</Text>
</View>
</View>

<View style={s.inputWrap}>
<TextInput
value={name}
onChangeText={setName}
style={s.input}
autoCapitalize='none'
placeholder='Choose debate name'
placeholderTextColor={colors.textSubtle}
/>
</View>

<Text
variant='bodyMd'
tone='muted'
style={s.identityHint}
>
{style}. Sharp but thoughtful.
</Text>

</View>


<View style={s.section}>
<Text variant='titleLg'>Choose a Sigil</Text>

<View style={s.sigilRow}>
{SIGILS.map(icon=>{
const on=sigil===icon
return(
<Pressable
key={icon}
onPress={()=>setSigil(icon)}
style={[
s.sigilChip,
on && s.sigilChipOn
]}
>
<Text variant='titleLg'>{icon}</Text>
</Pressable>
)
})}
</View>
</View>


<View style={s.section}>
<Text variant='titleLg'>Suggested Handles</Text>

<View style={s.chipGrid}>
{SUGGESTED_NAMES.map(handle=>{
const on=name===handle
return(
<Pressable
key={handle}
onPress={()=>setName(handle)}
style={[
s.pill,
on && s.pillOn
]}
>
<Text
variant='labelSm'
style={on?s.pillTextOn:s.pillText}
>
{handle}
</Text>
</Pressable>
)
})}
</View>
</View>


<View style={s.section}>
<Text variant='titleLg'>Debating Style</Text>

<View style={s.chipGrid}>
{STYLES.map(item=>{
const on=style===item
return(
<Pressable
key={item}
onPress={()=>setStyle(item)}
style={[
s.pill,
on && s.pillOn
]}
>
<Text
variant='labelSm'
style={on?s.pillTextOn:s.pillText}
>
{item}
</Text>
</Pressable>
)
})}
</View>
</View>

</ScrollView>

<View style={s.footer}>
<Pressable
onPress={onContinue}
onPressIn={()=>
Animated.timing(scale,{toValue:.97,duration:80,useNativeDriver:true}).start()
}
onPressOut={()=>
Animated.timing(scale,{toValue:1,duration:80,useNativeDriver:true}).start()
}
>
<Animated.View
style={[
s.cta,
{transform:[{scale}]}
]}
>
<Text
variant='labelLg'
tone='onAccent'
>
Enter Arena →
</Text>
</Animated.View>
</Pressable>
</View>

</KeyboardAvoidingView>
</SafeAreaView>
)
}

const s=StyleSheet.create({

safe:{
flex:1,
backgroundColor:colors.black,
},

topBar:{
paddingHorizontal:24,
paddingTop:8,
flexDirection:'row',
justifyContent:'space-between',
alignItems:'center',
},

backBtn:{
width:48,
height:48,
borderRadius:24,
backgroundColor:colors.surface,
borderWidth:1,
borderColor:colors.border,
alignItems:'center',
justifyContent:'center',
},

progressWrap:{
flexDirection:'row',
gap:8,
},

progressSeg:{
width:54,
height:6,
borderRadius:8,
backgroundColor:colors.surface2,
},

progressDone:{
backgroundColor:colors.lime,
opacity:.45,
},

progressActive:{
backgroundColor:colors.lime,
},

scrollContent:{
paddingBottom:40,
},

hero:{
paddingHorizontal:24,
paddingTop:30,
},

headline:{
marginTop:14,
},

subhead:{
marginTop:16,
},

identityCard:{
marginHorizontal:24,
marginTop:30,
padding:20,
borderRadius:24,
backgroundColor:'#0E1118',
borderWidth:1,
borderColor:'#1F2735',
gap:18,
},

identityTop:{
flexDirection:'row',
gap:14,
alignItems:'center',
},

sigilBadge:{
width:48,
height:48,
borderRadius:24,
backgroundColor:'rgba(202,255,51,.14)',
alignItems:'center',
justifyContent:'center',
},

inputWrap:{
borderWidth:1,
borderColor:'#2D3748',
borderRadius:18,
paddingHorizontal:16,
height:56,
justifyContent:'center',
},

input:{
color:colors.text,
fontSize:20,
fontWeight:'600',
},

identityHint:{
color:colors.lime,
},

section:{
paddingHorizontal:24,
marginTop:30,
gap:16,
},

sigilRow:{
flexDirection:'row',
gap:14,
},

sigilChip:{
width:58,
height:58,
borderRadius:29,
borderWidth:1.2,
borderColor:colors.border,
backgroundColor:colors.surface,
alignItems:'center',
justifyContent:'center',
},

sigilChipOn:{
backgroundColor:colors.lime,
borderColor:colors.lime,
},

chipGrid:{
flexDirection:'row',
flexWrap:'wrap',
gap:12,
},

pill:{
paddingHorizontal:18,
paddingVertical:12,
borderRadius:999,
borderWidth:1.2,
borderColor:'#2D3748',
backgroundColor:'transparent',
},

pillOn:{
backgroundColor:colors.lime,
borderColor:colors.lime,
},

pillText:{
color:'#D5D9E4',
fontSize:13,
},

pillTextOn:{
color:colors.black,
fontSize:13,
},

footer:{
paddingHorizontal:24,
paddingBottom:18,
},

cta:{
height:60,
borderRadius:30,
backgroundColor:colors.lime,
justifyContent:'center',
alignItems:'center',
}

})
