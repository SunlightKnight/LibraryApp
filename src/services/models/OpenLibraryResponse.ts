export interface Doc {
    key: string;
    type: string;
    title: string;
    author_name?: string[];
    publisher?: string[];
    language?: string[];
    isbn?: string[];
    cover_i?: number;
    first_publish_year?: number;
    edition_count?: number;
    number_of_pages_median?: number;
    subject?: string[];
    edition_key?: string[];
    cover_edition_key?: string;
    ratings_average?: number;
}

export interface OpenLibraryResponse {
    start: number;
    numFound: number;
    docs: Doc[];
}