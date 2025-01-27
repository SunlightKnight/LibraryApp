import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { View, Text } from "react-native"

type BookListProps = {
  parentProps: any
  navigation: any
  nav: any
}

function BookList(props: BookListProps) {
  const { t } = useTranslation()

  useEffect(() => {
    // props.parentProps.handleLoader(true)
  }, [])

  return (
    <View>
      <Text>{t("book_list.book_list_title")}</Text>
    </View>
  )
}

export default BookList