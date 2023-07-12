'use client'

import React, {useState, useEffect} from 'react'

import { SearchCompany, MultiRangeSlider, MultiRangeSliderDate } from '@/components'
import { CheckBox, RadioButton, RadioButtonGroup } from '@/components/_elements'

import { CompanyMetaData } from '@/types'

import { stringToLowerCaseWithoutWhitespace } from '@/utils/helpers'

const OtherPage = () => {

  // const [selectedCompMetaData, setSelectedCompMetaData] =
  //   useState<CompanyMetaData>({
  //     ticker: "MSFT",
  //     name: "",
  //     country: "",
  //     exchange: "",
  //     industry: "",
  //     sector: "",
  //     description: "",
  //   });

  // useEffect(() => {
  // console.log(selectedCompMetaData);
  // },[selectedCompMetaData])
  

  // function handleSetCompanySymbolCallback(compMeta: CompanyMetaData) {
  //   setSelectedCompMetaData(compMeta);
  // }


  const [setItem, setSetItem] = useState("value_1")
  const [setGItem, setGSetItem] = useState("test2")
  

  console.log("OtherPage render")

  return (
	<div className='min-h-screen'>
    {/* <SearchCompany callbackSetCompMeta={handleSetCompanySymbolCallback} /> */}
    <div>Content on site</div>
    {/* <CheckBox label='Test label for' /> */}

    {[1,2,3].map((d,i) => {
      return (
        <RadioButton key={i} label={`label ${i}`} value={`value_${i}`} groupName='tests1' onChange={(e) => {setSetItem(e.target.value)}} checked={`value_${i}` === setItem} />
      )
    })}

    <RadioButtonGroup groupName='tests' labels={['test1', 'test2', 'test3']} values={['test1', 'test2', 'test3']} onChange={(event: React.ChangeEvent<HTMLInputElement>,  selected: string) => { setGSetItem(selected); console.log(selected)}} defaultCheckedValue={stringToLowerCaseWithoutWhitespace('test2')}  />
    {setGItem}
    {/* <MultiRangeSlider min={0} max={101} onChange={(min: number, max: number) => { console.log(`${min} ${max}`) }} labelFormat={(value: number) => `number ${value}`} />
    <MultiRangeSliderDate min={new Date('2020-01-01')} max={new Date('2023-06-29')} onChange={(actMin: Date, actMax: Date) => { console.log(`${actMin} ${actMax}`) }} /> */}
  </div>
  )
}

export default OtherPage