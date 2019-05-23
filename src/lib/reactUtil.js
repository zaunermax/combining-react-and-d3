import React from 'react'

export const applyPropsToComponent = (appliedProps) => (C) => (actProps) => (
  <C {...appliedProps} {...actProps} />
)
