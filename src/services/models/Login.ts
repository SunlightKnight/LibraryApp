export interface login{
  username : string
  password : string
  email : string
  personal_info:{
    name : string
    surname : string
    date_of_birth : Date
  }
  recent_book : recent_book | null
  liked_books : liked_book[] | null
}

export interface liked_book{
  title: string
  author : string
  isbn : string
}

export interface recent_book{
  title : string
  author : string
  isbn : string
  subject : string
}