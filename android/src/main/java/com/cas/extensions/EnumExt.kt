package com.cas.extensions

inline fun <reified T : Enum<T>> Int.toEnum(): T? {
  return enumValues<T>().firstOrNull { it.ordinal == this }
}

inline fun <reified T : Enum<T>> T.toInt(): Int {
  return this.ordinal
}
