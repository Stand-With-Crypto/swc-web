'use client'

import React from 'react'
import { Marker } from 'react-simple-maps'
import { motion } from 'framer-motion'

import { IconProps } from '@/components/app/pageAdvocatesHeatmap/advocateHeatmapIcons'

export function AdvocateHeatmapMarker({
  coordinates,
  IconComponent,
  handleActionMouseOut,
  handleActionMouseOver,
  currentActionInfo,
}: {
  coordinates: [number, number]
  IconComponent: React.FC<IconProps>
  handleActionMouseOut: () => void
  handleActionMouseOver: (
    currentActionInfo: string,
    event: React.MouseEvent<SVGElement, MouseEvent>,
  ) => void
  currentActionInfo: string
}) {
  return (
    <motion.g
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      initial={{ opacity: 0, scale: 0.8 }}
      onMouseOut={handleActionMouseOut}
      onMouseOver={event => handleActionMouseOver(currentActionInfo, event)}
      transition={{ duration: 0.5 }}
    >
      <Marker coordinates={coordinates}>
        <IconComponent isPulsing={true} />
      </Marker>
    </motion.g>
  )
}
