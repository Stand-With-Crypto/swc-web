'use client'

import React from 'react'
import { Marker } from 'react-simple-maps'
import { motion } from 'motion/react'

import { IconProps } from '@/components/app/pageAdvocatesHeatmap/advocateHeatmapIcons'

export function AdvocateHeatmapMarker({
  coordinates,
  IconComponent,
  handleActionMouseLeave,
  handleActionMouseOver,
  currentActionInfo,
  size,
}: {
  coordinates: [number, number]
  IconComponent: React.FC<IconProps>
  size?: number
  handleActionMouseLeave: (event: React.MouseEvent<SVGElement, MouseEvent>) => void
  handleActionMouseOver: (
    currentActionInfo: string,
    event: React.MouseEvent<SVGElement, MouseEvent>,
  ) => void
  currentActionInfo: string
}) {
  return (
    <motion.g
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      initial={{ opacity: 0, scale: 0.3 }}
      onMouseLeave={handleActionMouseLeave}
      onMouseOver={event => handleActionMouseOver(currentActionInfo, event)}
      transition={{ duration: 0.5 }}
    >
      <Marker coordinates={coordinates}>
        <IconComponent height={size} isPulsing={true} width={size} />
      </Marker>
    </motion.g>
  )
}
