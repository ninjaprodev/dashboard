import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Tooltip, TooltipArrow } from 'styled-tooltip-component'
import {
  TooltipWrapContainer,
  TooltipCustomInner,
  TooltipCustomArrow,
  TooltipCustomWrap,
} from './styles'

import { observer } from 'mobx-react'

interface IProps {
  activator: any
}

export const TooltipCustom: React.FC<IProps> = observer((props) => {
  const [hidden, setHidden] = useState(true)
  const [position, setPosition] = useState([0, 0])
  const tooltipRef = useRef(null)

  return (
    <TooltipWrapContainer ref={tooltipRef}>
      <div
        onMouseEnter={() => {
          setHidden(false)
          setPosition([
            tooltipRef.current.offsetHeight,
            tooltipRef.current.offsetLeft,
          ])
        }}
        onMouseLeave={() => {
          setHidden(true)
        }}
      >
        <>
          {props.activator}
          <TooltipCustomWrap
            hidden={hidden}
            style={{
              bottom: `${position[0]}px`,
              left: `${position[1]}px`,
            }}
            top
          >
            <TooltipCustomArrow top />
            <TooltipCustomInner top>{props.children}</TooltipCustomInner>
          </TooltipCustomWrap>
        </>
      </div>
    </TooltipWrapContainer>
  )
})
