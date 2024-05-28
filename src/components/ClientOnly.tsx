'use client'

import {PropsWithChildren, useEffect, useState} from "react";

const ClientOnly: React.FC<PropsWithChildren> = ({ children}) => {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if(!hasMounted) {
    return  null;
  }

  return (
    <>
      {children}
    </>
  )
}

export default ClientOnly
