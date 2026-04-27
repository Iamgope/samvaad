import React, { useRef, useState } from 'react';
import {
 View,
 StyleSheet,
 Pressable,
 TouchableOpacity,
 Animated,
 ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { colors } from '../constants/colors';
import { Text } from '../components/Text';

type Props = {
 navigation: NativeStackNavigationProp<RootStackParamList,'ChooseArenas'>;
};

type CategoryKey=
|'sports'
|'arts'
|'ideas'
|'tech';

const MIN_REQUIRED=1;

const SECTIONS=[
{
 key:'sports',
 icon:'⚽',
 title:'Sports',
 subtitle:'From strategy to superstars.',
 items:[
 '🏏 Cricket',
 '⚽ Football',
 '🏀 Basketball',
 '🎾 Tennis',
 '🏎 Formula 1',
 '🥊 MMA / UFC'
 ]
},
{
 key:'arts',
 icon:'🎬',
 title:'Arts & Literature',
 subtitle:'Stories, screens and great minds.',
 items:[
 '🎬 Movies',
 '🎭 Bollywood',
 '🎞 French Cinema',
 '📚 Murakami',
 '📖 Kafka',
 '🎨 Art & Design'
 ]
},
{
 key:'ideas',
 icon:'🧠',
 title:'Ideas & Society',
 subtitle:'Big ideas. Real impact.',
 items:[
 '🧠 Philosophy',
 '⚖ Ethics',
 '🌍 Politics',
 '💰 Economics',
 '🌱 Environment',
 '⚖ Law'
 ]
},
{
 key:'tech',
 icon:'🚀',
 title:'Tech & The Future',
 subtitle:'Innovation shaping tomorrow.',
 items:[
 '💻 Technology',
 '🤖 AI',
 '🚀 Space',
 '📱 Startups',
 '🎮 Gaming',
 '🔐 Cybersecurity'
 ]
}
] as const;

export default function ChooseArenasScreen({navigation}:Props){

const [selected,setSelected]=useState<Record<CategoryKey,Set<string>>>({
 sports:new Set(),
 arts:new Set(),
 ideas:new Set(),
 tech:new Set(),
});

const scale=useRef(new Animated.Value(1)).current;

const toggle=(category:CategoryKey,item:string)=>{
 setSelected(prev=>{
   const next={...prev};
   const set = new Set(next[category]);

   if(set.has(item)) set.delete(item)
   else set.add(item)

   next[category]=set;
   return next;
 })
}

const count=(k:CategoryKey)=>selected[k].size;

const total=
 count('sports')+
 count('arts')+
 count('ideas')+
 count('tech');

const canContinue=
 count('sports')>=1 &&
 count('arts')>=1 &&
 count('ideas')>=1 &&
 count('tech')>=1;

const onContinue=()=>{
 if(!canContinue) return;

 const arenas=Object.values(selected)
  .flatMap(s=>Array.from(s));

 navigation.navigate('ChooseName',{arenas})
}

return(
<SafeAreaView style={s.safe} edges={['top','bottom']}>
<StatusBar style='light'/>

<View style={s.topBar}>
 <TouchableOpacity
   style={s.backBtn}
   onPress={()=>navigation.goBack()}
 >
   <Text variant='titleLg'>←</Text>
 </TouchableOpacity>

 <View style={s.progressWrap}>
   <View style={[s.progressSeg,s.progressActive]}/>
   <View style={s.progressSeg}/>
   <View style={s.progressSeg}/>
 </View>
</View>

<ScrollView
 showsVerticalScrollIndicator={false}
 contentContainerStyle={s.scrollContent}
>

<View style={s.hero}>
 <Text variant='overline' tone='accent'>STEP 1 OF 3</Text>

 <View style={s.heroTitleWrap}>
   <Text variant='displayMd'>What </Text>
   <Text variant='displayMd' tone='accent'>excites</Text>
   <Text variant='displayMd'> you?</Text>
 </View>

 <Text
  variant='bodyLg'
  tone='muted'
  style={s.heroSub}
 >
  Pick at least 1 topic you love debating.
 </Text>

 <View style={s.counterPill}>
   <Text variant='labelMd' tone='accent'>✓</Text>
   <Text variant='labelMd'> {total} selected</Text>
 </View>
</View>

<View style={s.sectionStack}>
{SECTIONS.map(section=>{
 const done=count(section.key)>=1;

 return(
<View
 key={section.key}
 style={s.card}
>
<View style={s.cardTop}>

<View style={s.cardMeta}>
 <View style={s.iconCircle}>
   <Text>{section.icon}</Text>
 </View>

 <View>
   <Text variant='titleLg'>
    {section.title}
   </Text>

   <Text variant='bodyMd' tone='muted'>
    {section.subtitle}
   </Text>
 </View>
</View>

<Text
 variant='titleMd'
 style={done?s.chevDone:s.chev}
>
›
</Text>

</View>

<View style={s.pillGrid}>
{section.items.map(item=>{
 const on=selected[section.key].has(item)

 return(
<Pressable
 key={item}
 onPress={()=>toggle(section.key,item)}
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
)
})}
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
 !canContinue && s.ctaDisabled,
 {transform:[{scale}]}
]}
>
<Text
 variant='labelLg'
 tone='onAccent'
>
Continue →
</Text>
</Animated.View>
</Pressable>
</View>

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
alignItems:'center',
justifyContent:'space-between',
},

backBtn:{
width:48,
height:48,
borderRadius:24,
backgroundColor:colors.surface,
alignItems:'center',
justifyContent:'center',
borderWidth:1,
borderColor:colors.border,
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

progressActive:{
backgroundColor:colors.lime,
},

scrollContent:{
paddingBottom:40,
},

hero:{
paddingHorizontal:24,
paddingTop:32,
},

heroTitleWrap:{
flexDirection:'row',
flexWrap:'wrap',
alignItems:'flex-end',
marginTop:14,
},

heroSub:{
marginTop:18,
},

counterPill:{
marginTop:24,
alignSelf:'flex-start',
flexDirection:'row',
alignItems:'center',
borderWidth:1,
borderColor:colors.border,
borderRadius:999,
paddingHorizontal:16,
paddingVertical:10,
},

sectionStack:{
paddingHorizontal:24,
marginTop:28,
gap:18,
},

card:{
backgroundColor:'#0E1118',
borderWidth:1,
borderColor:'#1F2735',
borderRadius:24,
padding:18,
gap:18,
},

cardTop:{
flexDirection:'row',
justifyContent:'space-between',
alignItems:'center',
},

cardMeta:{
flexDirection:'row',
gap:14,
alignItems:'center',
},

iconCircle:{
width:40,
height:40,
borderRadius:20,
backgroundColor:'rgba(202,255,51,.12)',
alignItems:'center',
justifyContent:'center',
},

chev:{
color:colors.textMuted,
},

chevDone:{
color:colors.lime,
},

pillGrid:{
flexDirection:'row',
flexWrap:'wrap',
gap:12,
},

pill:{
width:'48%',
minHeight:44,
borderRadius:999,
borderWidth:1.2,
borderColor:'#2D3748',
justifyContent:'center',
alignItems:'center',
paddingHorizontal:12,
paddingVertical:11,
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
alignItems:'center',
justifyContent:'center',
},

ctaDisabled:{
opacity:.45,
}
})
