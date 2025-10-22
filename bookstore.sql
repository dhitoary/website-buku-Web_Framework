--
-- PostgreSQL database dump
--

\restrict LsuC4E9jQ6FN2g23dMUSp9gE1NK4mWtROPEBCUEuOndaORxLwPd2P9RPJaaaw40

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-10-22 18:45:40

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 6 (class 2615 OID 40347)
-- Name: auth; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO postgres;

--
-- TOC entry 7 (class 2615 OID 40348)
-- Name: core; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA core;


ALTER SCHEMA core OWNER TO postgres;

--
-- TOC entry 8 (class 2615 OID 40349)
-- Name: reporting; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA reporting;


ALTER SCHEMA reporting OWNER TO postgres;

--
-- TOC entry 2 (class 3079 OID 40397)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 5163 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 883 (class 1247 OID 40351)
-- Name: role_type; Type: TYPE; Schema: auth; Owner: postgres
--

CREATE TYPE auth.role_type AS ENUM (
    'admin',
    'user'
);


ALTER TYPE auth.role_type OWNER TO postgres;

--
-- TOC entry 907 (class 1247 OID 40395)
-- Name: email_address; Type: DOMAIN; Schema: core; Owner: postgres
--

CREATE DOMAIN core.email_address AS text
	CONSTRAINT email_address_check CHECK ((VALUE ~~ '%@%.%'::text));


ALTER DOMAIN core.email_address OWNER TO postgres;

--
-- TOC entry 892 (class 1247 OID 40380)
-- Name: notification_status_type; Type: TYPE; Schema: core; Owner: postgres
--

CREATE TYPE core.notification_status_type AS ENUM (
    'read',
    'unread'
);


ALTER TYPE core.notification_status_type OWNER TO postgres;

--
-- TOC entry 886 (class 1247 OID 40356)
-- Name: order_status_type; Type: TYPE; Schema: core; Owner: postgres
--

CREATE TYPE core.order_status_type AS ENUM (
    'menunggu_pembayaran',
    'menunggu_konfirmasi',
    'diproses',
    'dikirim',
    'selesai',
    'dibatalkan'
);


ALTER TYPE core.order_status_type OWNER TO postgres;

--
-- TOC entry 889 (class 1247 OID 40370)
-- Name: payment_status_type; Type: TYPE; Schema: core; Owner: postgres
--

CREATE TYPE core.payment_status_type AS ENUM (
    'pending',
    'success',
    'failed',
    'refunded'
);


ALTER TYPE core.payment_status_type OWNER TO postgres;

--
-- TOC entry 899 (class 1247 OID 40389)
-- Name: positive_currency; Type: DOMAIN; Schema: core; Owner: postgres
--

CREATE DOMAIN core.positive_currency AS numeric(12,2)
	CONSTRAINT positive_currency_check CHECK ((VALUE >= 0.00));


ALTER DOMAIN core.positive_currency OWNER TO postgres;

--
-- TOC entry 895 (class 1247 OID 40386)
-- Name: positive_integer; Type: DOMAIN; Schema: core; Owner: postgres
--

CREATE DOMAIN core.positive_integer AS integer
	CONSTRAINT positive_integer_check CHECK ((VALUE >= 0));


ALTER DOMAIN core.positive_integer OWNER TO postgres;

--
-- TOC entry 903 (class 1247 OID 40392)
-- Name: url_link; Type: DOMAIN; Schema: core; Owner: postgres
--

CREATE DOMAIN core.url_link AS text
	CONSTRAINT url_link_check CHECK (((VALUE IS NULL) OR (VALUE ~~ 'http://%'::text) OR (VALUE ~~ 'https://%'::text)));


ALTER DOMAIN core.url_link OWNER TO postgres;

--
-- TOC entry 265 (class 1255 OID 40718)
-- Name: fn_create_payment_notification(); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.fn_create_payment_notification() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_user_id UUID;
    v_order_code VARCHAR(50);
BEGIN
    -- Ambil data user_id dan order_code dari pesanan terkait
    SELECT user_id, order_code
    INTO v_user_id, v_order_code
    FROM core.orders
    WHERE order_id = NEW.order_id;
    
    -- Masukkan notifikasi baru ke tabel 'core.notifications'
    INSERT INTO core.notifications (user_id, title, message, link_url)
    VALUES (
        v_user_id,
        'Pembayaran Berhasil!',
        'Pembayaranmu untuk pesanan ' || v_order_code || ' telah kami konfirmasi.',
        '/my-orders/' || NEW.order_id::TEXT
    );
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION core.fn_create_payment_notification() OWNER TO postgres;

--
-- TOC entry 264 (class 1255 OID 40716)
-- Name: fn_decrease_stock(); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.fn_decrease_stock() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- 'rec' adalah variabel untuk menyimpan baris data
    -- dari hasil looping (FOR ... LOOP)
    rec RECORD;
BEGIN
    -- Loop melalui semua 'order_items' yang terkait
    -- dengan 'orders' yang baru saja di-UPDATE (NEW.order_id)
    FOR rec IN
        SELECT book_id, quantity
        FROM core.order_items
        WHERE order_id = NEW.order_id
    LOOP
        -- Kurangi stok di tabel 'core.books'
        UPDATE core.books
        SET stock = stock - rec.quantity
        WHERE book_id = rec.book_id;
    END LOOP;

    RETURN NEW;
END;
$$;


ALTER FUNCTION core.fn_decrease_stock() OWNER TO postgres;

--
-- TOC entry 251 (class 1255 OID 40690)
-- Name: fn_set_updated_at(); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.fn_set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- 'NEW' adalah variabel khusus dalam trigger
    -- yang berisi baris data yang *akan* disimpan.
    -- Kita memodifikasi kolom 'updated_at' dari baris baru ini
    -- menjadi waktu saat ini.
    NEW.updated_at = now();
    
    -- Kita kembalikan 'NEW' agar proses UPDATE
    -- dapat dilanjutkan dengan data yang sudah dimodifikasi.
    RETURN NEW;
END;
$$;


ALTER FUNCTION core.fn_set_updated_at() OWNER TO postgres;

--
-- TOC entry 263 (class 1255 OID 40714)
-- Name: fn_update_order_total(); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.fn_update_order_total() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_order_id UUID;
    v_total_items_price NUMERIC;
    v_shipping_cost NUMERIC;
BEGIN
    -- Tentukan order_id mana yang terpengaruh
    IF (TG_OP = 'DELETE') THEN
        -- OLD berisi data baris yang BARU SAJA dihapus
        v_order_id := OLD.order_id;
    ELSE
        -- NEW berisi data baris yang BARU SAJA dimasukkan/diubah
        v_order_id := NEW.order_id;
    END IF;

    -- Hitung ulang total harga ITEM dari 'order_items'
    SELECT
        COALESCE(SUM(snapshot_price_per_item * quantity), 0.00)
    INTO
        v_total_items_price
    FROM
        core.order_items
    WHERE
        order_id = v_order_id;
        
    -- Ambil biaya kirim (karena total akhir = item + kirim)
    SELECT
        shipping_cost
    INTO
        v_shipping_cost
    FROM
        core.orders
    WHERE
        order_id = v_order_id;

    -- Update tabel 'orders' (tabel induk)
    UPDATE core.orders
    SET
        total_items_price = v_total_items_price,
        -- Total akhir adalah jumlah harga item + biaya kirim
        total_amount = v_total_items_price + v_shipping_cost
    WHERE
        order_id = v_order_id;

    -- Kembalikan NEW (atau NULL untuk DELETE) agar trigger selesai
    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;


ALTER FUNCTION core.fn_update_order_total() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 221 (class 1259 OID 40408)
-- Name: users; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.users (
    user_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email core.email_address NOT NULL,
    password_hash text NOT NULL,
    role auth.role_type DEFAULT 'user'::auth.role_type NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE auth.users OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 40451)
-- Name: authors; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.authors (
    author_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    bio text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE core.authors OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 40494)
-- Name: book_authors; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.book_authors (
    book_id uuid NOT NULL,
    author_id uuid NOT NULL
);


ALTER TABLE core.book_authors OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 40509)
-- Name: book_categories; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.book_categories (
    book_id uuid NOT NULL,
    category_id uuid NOT NULL
);


ALTER TABLE core.book_categories OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 40475)
-- Name: books; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.books (
    book_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    publisher_id uuid,
    title text NOT NULL,
    isbn character varying(13),
    description text,
    page_count core.positive_integer,
    published_year smallint,
    price core.positive_currency DEFAULT 0.00 NOT NULL,
    stock core.positive_integer DEFAULT 0 NOT NULL,
    cover_image_url core.url_link,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE core.books OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 40555)
-- Name: cart_items; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.cart_items (
    cart_item_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    cart_id uuid NOT NULL,
    book_id uuid NOT NULL,
    quantity core.positive_integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT cart_items_quantity_check CHECK (((quantity)::integer > 0))
);


ALTER TABLE core.cart_items OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 40540)
-- Name: carts; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.carts (
    cart_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE core.carts OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 40461)
-- Name: categories; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.categories (
    category_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE core.categories OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 40675)
-- Name: notifications; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.notifications (
    notification_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    link_url text,
    status core.notification_status_type DEFAULT 'unread'::core.notification_status_type NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE core.notifications OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 40635)
-- Name: order_items; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.order_items (
    order_item_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id uuid NOT NULL,
    book_id uuid,
    quantity core.positive_integer NOT NULL,
    snapshot_book_title text NOT NULL,
    snapshot_price_per_item core.positive_currency NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT order_items_quantity_check CHECK (((quantity)::integer > 0))
);


ALTER TABLE core.order_items OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 40611)
-- Name: orders; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.orders (
    order_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    user_address_id uuid NOT NULL,
    status core.order_status_type DEFAULT 'menunggu_pembayaran'::core.order_status_type NOT NULL,
    order_code character varying(50) NOT NULL,
    total_items_price core.positive_currency NOT NULL,
    shipping_cost core.positive_currency DEFAULT 0.00 NOT NULL,
    total_amount core.positive_currency NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE core.orders OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 40656)
-- Name: payments; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.payments (
    payment_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id uuid NOT NULL,
    status core.payment_status_type DEFAULT 'pending'::core.payment_status_type NOT NULL,
    payment_method character varying(50) DEFAULT 'qris_manual'::character varying NOT NULL,
    amount_due core.positive_currency NOT NULL,
    amount_paid core.positive_currency,
    proof_image_url core.url_link,
    paid_at timestamp with time zone,
    confirmed_at timestamp with time zone,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE core.payments OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 40439)
-- Name: publishers; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.publishers (
    publisher_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE core.publishers OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 40524)
-- Name: user_addresses; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.user_addresses (
    user_address_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    label text NOT NULL,
    recipient_name text NOT NULL,
    recipient_phone character varying(20) NOT NULL,
    full_address text NOT NULL,
    city text NOT NULL,
    postal_code character varying(10),
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE core.user_addresses OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 40422)
-- Name: user_profiles; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.user_profiles (
    user_profile_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    full_name text NOT NULL,
    profile_image_url core.url_link,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE core.user_profiles OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 40704)
-- Name: v_book_details; Type: VIEW; Schema: core; Owner: postgres
--

CREATE VIEW core.v_book_details AS
 WITH book_author_data AS (
         SELECT ba_1.book_id,
            json_agg(json_build_object('author_id', a.author_id, 'name', a.name)) AS authors
           FROM (core.book_authors ba_1
             JOIN core.authors a ON ((ba_1.author_id = a.author_id)))
          WHERE (a.deleted_at IS NULL)
          GROUP BY ba_1.book_id
        ), book_category_data AS (
         SELECT bc_1.book_id,
            json_agg(json_build_object('category_id', c.category_id, 'name', c.name, 'slug', c.slug)) AS categories
           FROM (core.book_categories bc_1
             JOIN core.categories c ON ((bc_1.category_id = c.category_id)))
          WHERE (c.deleted_at IS NULL)
          GROUP BY bc_1.book_id
        )
 SELECT b.book_id,
    b.title,
    b.isbn,
    b.description,
    b.page_count,
    b.published_year,
    b.price,
    b.stock,
    b.cover_image_url,
    b.created_at,
    b.updated_at,
    json_build_object('publisher_id', p.publisher_id, 'name', p.name) AS publisher,
    COALESCE(ba.authors, '[]'::json) AS authors,
    COALESCE(bc.categories, '[]'::json) AS categories
   FROM (((core.books b
     LEFT JOIN core.publishers p ON ((b.publisher_id = p.publisher_id)))
     LEFT JOIN book_author_data ba ON ((b.book_id = ba.book_id)))
     LEFT JOIN book_category_data bc ON ((b.book_id = bc.book_id)))
  WHERE ((b.deleted_at IS NULL) AND ((p.deleted_at IS NULL) OR (p.publisher_id IS NULL)));


ALTER VIEW core.v_book_details OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 40592)
-- Name: wishlist_items; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.wishlist_items (
    wishlist_item_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    wishlist_id uuid NOT NULL,
    book_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE core.wishlist_items OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 40577)
-- Name: wishlists; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.wishlists (
    wishlist_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE core.wishlists OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 40740)
-- Name: mv_sales_per_day; Type: MATERIALIZED VIEW; Schema: reporting; Owner: postgres
--

CREATE MATERIALIZED VIEW reporting.mv_sales_per_day AS
 SELECT date_trunc('day'::text, created_at) AS sales_date,
    count(order_id) AS total_orders,
    sum((total_amount)::numeric) AS total_revenue,
    avg((total_amount)::numeric) AS average_order_value,
    count(DISTINCT user_id) AS total_unique_customers
   FROM core.orders o
  WHERE (status = ANY (ARRAY['diproses'::core.order_status_type, 'dikirim'::core.order_status_type, 'selesai'::core.order_status_type]))
  GROUP BY (date_trunc('day'::text, created_at))
  ORDER BY (date_trunc('day'::text, created_at)) DESC
  WITH NO DATA;


ALTER MATERIALIZED VIEW reporting.mv_sales_per_day OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 40709)
-- Name: v_sales_overview; Type: VIEW; Schema: reporting; Owner: postgres
--

CREATE VIEW reporting.v_sales_overview AS
 SELECT o.order_id,
    o.order_code,
    o.status AS order_status,
    o.total_amount,
    o.created_at AS order_date,
    p.payment_id,
    p.status AS payment_status,
    p.payment_method,
    p.proof_image_url,
    p.paid_at,
    p.confirmed_at,
    u.user_id,
    up.full_name AS user_name,
    u.email AS user_email
   FROM (((core.orders o
     JOIN core.payments p ON ((o.order_id = p.order_id)))
     JOIN auth.users u ON ((o.user_id = u.user_id)))
     LEFT JOIN core.user_profiles up ON ((u.user_id = up.user_id)))
  WHERE ((o.deleted_at IS NULL) AND (u.deleted_at IS NULL) AND ((up.deleted_at IS NULL) OR (up.user_profile_id IS NULL)));


ALTER VIEW reporting.v_sales_overview OWNER TO postgres;

--
-- TOC entry 5136 (class 0 OID 40408)
-- Dependencies: 221
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.users (user_id, email, password_hash, role, is_active, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5139 (class 0 OID 40451)
-- Dependencies: 224
-- Data for Name: authors; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.authors (author_id, name, bio, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5142 (class 0 OID 40494)
-- Dependencies: 227
-- Data for Name: book_authors; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.book_authors (book_id, author_id) FROM stdin;
\.


--
-- TOC entry 5143 (class 0 OID 40509)
-- Dependencies: 228
-- Data for Name: book_categories; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.book_categories (book_id, category_id) FROM stdin;
\.


--
-- TOC entry 5141 (class 0 OID 40475)
-- Dependencies: 226
-- Data for Name: books; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.books (book_id, publisher_id, title, isbn, description, page_count, published_year, price, stock, cover_image_url, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5146 (class 0 OID 40555)
-- Dependencies: 231
-- Data for Name: cart_items; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.cart_items (cart_item_id, cart_id, book_id, quantity, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5145 (class 0 OID 40540)
-- Dependencies: 230
-- Data for Name: carts; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.carts (cart_id, user_id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5140 (class 0 OID 40461)
-- Dependencies: 225
-- Data for Name: categories; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.categories (category_id, name, slug, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5152 (class 0 OID 40675)
-- Dependencies: 237
-- Data for Name: notifications; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.notifications (notification_id, user_id, title, message, link_url, status, created_at) FROM stdin;
\.


--
-- TOC entry 5150 (class 0 OID 40635)
-- Dependencies: 235
-- Data for Name: order_items; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.order_items (order_item_id, order_id, book_id, quantity, snapshot_book_title, snapshot_price_per_item, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5149 (class 0 OID 40611)
-- Dependencies: 234
-- Data for Name: orders; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.orders (order_id, user_id, user_address_id, status, order_code, total_items_price, shipping_cost, total_amount, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5151 (class 0 OID 40656)
-- Dependencies: 236
-- Data for Name: payments; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.payments (payment_id, order_id, status, payment_method, amount_due, amount_paid, proof_image_url, paid_at, confirmed_at, admin_notes, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5138 (class 0 OID 40439)
-- Dependencies: 223
-- Data for Name: publishers; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.publishers (publisher_id, name, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5144 (class 0 OID 40524)
-- Dependencies: 229
-- Data for Name: user_addresses; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.user_addresses (user_address_id, user_id, label, recipient_name, recipient_phone, full_address, city, postal_code, is_primary, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5137 (class 0 OID 40422)
-- Dependencies: 222
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.user_profiles (user_profile_id, user_id, full_name, profile_image_url, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5148 (class 0 OID 40592)
-- Dependencies: 233
-- Data for Name: wishlist_items; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.wishlist_items (wishlist_item_id, wishlist_id, book_id, created_at) FROM stdin;
\.


--
-- TOC entry 5147 (class 0 OID 40577)
-- Dependencies: 232
-- Data for Name: wishlists; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.wishlists (wishlist_id, user_id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4876 (class 2606 OID 40421)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4878 (class 2606 OID 40419)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4889 (class 2606 OID 40460)
-- Name: authors authors_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.authors
    ADD CONSTRAINT authors_pkey PRIMARY KEY (author_id);


--
-- TOC entry 4903 (class 2606 OID 40498)
-- Name: book_authors book_authors_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.book_authors
    ADD CONSTRAINT book_authors_pkey PRIMARY KEY (book_id, author_id);


--
-- TOC entry 4907 (class 2606 OID 40513)
-- Name: book_categories book_categories_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.book_categories
    ADD CONSTRAINT book_categories_pkey PRIMARY KEY (book_id, category_id);


--
-- TOC entry 4897 (class 2606 OID 40488)
-- Name: books books_isbn_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.books
    ADD CONSTRAINT books_isbn_key UNIQUE (isbn);


--
-- TOC entry 4899 (class 2606 OID 40486)
-- Name: books books_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (book_id);


--
-- TOC entry 4918 (class 2606 OID 40566)
-- Name: cart_items cart_items_cart_id_book_id_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.cart_items
    ADD CONSTRAINT cart_items_cart_id_book_id_key UNIQUE (cart_id, book_id);


--
-- TOC entry 4920 (class 2606 OID 40564)
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (cart_item_id);


--
-- TOC entry 4914 (class 2606 OID 40547)
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (cart_id);


--
-- TOC entry 4916 (class 2606 OID 40549)
-- Name: carts carts_user_id_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.carts
    ADD CONSTRAINT carts_user_id_key UNIQUE (user_id);


--
-- TOC entry 4891 (class 2606 OID 40472)
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- TOC entry 4893 (class 2606 OID 40470)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (category_id);


--
-- TOC entry 4895 (class 2606 OID 40474)
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- TOC entry 4952 (class 2606 OID 40684)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- TOC entry 4943 (class 2606 OID 40645)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (order_item_id);


--
-- TOC entry 4937 (class 2606 OID 40624)
-- Name: orders orders_order_code_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.orders
    ADD CONSTRAINT orders_order_code_key UNIQUE (order_code);


--
-- TOC entry 4939 (class 2606 OID 40622)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);


--
-- TOC entry 4947 (class 2606 OID 40669)
-- Name: payments payments_order_id_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.payments
    ADD CONSTRAINT payments_order_id_key UNIQUE (order_id);


--
-- TOC entry 4949 (class 2606 OID 40667)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (payment_id);


--
-- TOC entry 4885 (class 2606 OID 40450)
-- Name: publishers publishers_name_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.publishers
    ADD CONSTRAINT publishers_name_key UNIQUE (name);


--
-- TOC entry 4887 (class 2606 OID 40448)
-- Name: publishers publishers_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.publishers
    ADD CONSTRAINT publishers_pkey PRIMARY KEY (publisher_id);


--
-- TOC entry 4912 (class 2606 OID 40534)
-- Name: user_addresses user_addresses_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.user_addresses
    ADD CONSTRAINT user_addresses_pkey PRIMARY KEY (user_address_id);


--
-- TOC entry 4881 (class 2606 OID 40431)
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (user_profile_id);


--
-- TOC entry 4883 (class 2606 OID 40433)
-- Name: user_profiles user_profiles_user_id_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.user_profiles
    ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);


--
-- TOC entry 4930 (class 2606 OID 40598)
-- Name: wishlist_items wishlist_items_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.wishlist_items
    ADD CONSTRAINT wishlist_items_pkey PRIMARY KEY (wishlist_item_id);


--
-- TOC entry 4932 (class 2606 OID 40600)
-- Name: wishlist_items wishlist_items_wishlist_id_book_id_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.wishlist_items
    ADD CONSTRAINT wishlist_items_wishlist_id_book_id_key UNIQUE (wishlist_id, book_id);


--
-- TOC entry 4924 (class 2606 OID 40584)
-- Name: wishlists wishlists_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.wishlists
    ADD CONSTRAINT wishlists_pkey PRIMARY KEY (wishlist_id);


--
-- TOC entry 4926 (class 2606 OID 40586)
-- Name: wishlists wishlists_user_id_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.wishlists
    ADD CONSTRAINT wishlists_user_id_key UNIQUE (user_id);


--
-- TOC entry 4904 (class 1259 OID 40723)
-- Name: idx_book_authors_author_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_book_authors_author_id ON core.book_authors USING btree (author_id);


--
-- TOC entry 4905 (class 1259 OID 40722)
-- Name: idx_book_authors_book_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_book_authors_book_id ON core.book_authors USING btree (book_id);


--
-- TOC entry 4908 (class 1259 OID 40724)
-- Name: idx_book_categories_book_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_book_categories_book_id ON core.book_categories USING btree (book_id);


--
-- TOC entry 4909 (class 1259 OID 40725)
-- Name: idx_book_categories_category_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_book_categories_category_id ON core.book_categories USING btree (category_id);


--
-- TOC entry 4900 (class 1259 OID 40739)
-- Name: idx_books_fts; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_books_fts ON core.books USING gin (to_tsvector('simple'::regconfig, ((title || ' '::text) || COALESCE(description, ''::text))));


--
-- TOC entry 4901 (class 1259 OID 40721)
-- Name: idx_books_publisher_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_books_publisher_id ON core.books USING btree (publisher_id);


--
-- TOC entry 4921 (class 1259 OID 40728)
-- Name: idx_cart_items_book_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_cart_items_book_id ON core.cart_items USING btree (book_id);


--
-- TOC entry 4922 (class 1259 OID 40727)
-- Name: idx_cart_items_cart_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_cart_items_cart_id ON core.cart_items USING btree (cart_id);


--
-- TOC entry 4950 (class 1259 OID 40738)
-- Name: idx_notifications_user_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_notifications_user_id ON core.notifications USING btree (user_id);


--
-- TOC entry 4940 (class 1259 OID 40735)
-- Name: idx_order_items_book_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_order_items_book_id ON core.order_items USING btree (book_id);


--
-- TOC entry 4941 (class 1259 OID 40734)
-- Name: idx_order_items_order_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_order_items_order_id ON core.order_items USING btree (order_id);


--
-- TOC entry 4933 (class 1259 OID 40733)
-- Name: idx_orders_status; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_orders_status ON core.orders USING btree (status);


--
-- TOC entry 4934 (class 1259 OID 40732)
-- Name: idx_orders_user_address_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_orders_user_address_id ON core.orders USING btree (user_address_id);


--
-- TOC entry 4935 (class 1259 OID 40731)
-- Name: idx_orders_user_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_orders_user_id ON core.orders USING btree (user_id);


--
-- TOC entry 4944 (class 1259 OID 40736)
-- Name: idx_payments_order_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_payments_order_id ON core.payments USING btree (order_id);


--
-- TOC entry 4945 (class 1259 OID 40737)
-- Name: idx_payments_status; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_payments_status ON core.payments USING btree (status);


--
-- TOC entry 4910 (class 1259 OID 40726)
-- Name: idx_user_addresses_user_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_user_addresses_user_id ON core.user_addresses USING btree (user_id);


--
-- TOC entry 4879 (class 1259 OID 40720)
-- Name: idx_user_profiles_user_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_user_profiles_user_id ON core.user_profiles USING btree (user_id);


--
-- TOC entry 4927 (class 1259 OID 40730)
-- Name: idx_wishlist_items_book_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_wishlist_items_book_id ON core.wishlist_items USING btree (book_id);


--
-- TOC entry 4928 (class 1259 OID 40729)
-- Name: idx_wishlist_items_wishlist_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_wishlist_items_wishlist_id ON core.wishlist_items USING btree (wishlist_id);


--
-- TOC entry 4972 (class 2620 OID 40691)
-- Name: users trg_users_set_updated_at; Type: TRIGGER; Schema: auth; Owner: postgres
--

CREATE TRIGGER trg_users_set_updated_at BEFORE UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION core.fn_set_updated_at();


--
-- TOC entry 4975 (class 2620 OID 40694)
-- Name: authors trg_authors_set_updated_at; Type: TRIGGER; Schema: core; Owner: postgres
--

CREATE TRIGGER trg_authors_set_updated_at BEFORE UPDATE ON core.authors FOR EACH ROW EXECUTE FUNCTION core.fn_set_updated_at();


--
-- TOC entry 4977 (class 2620 OID 40696)
-- Name: books trg_books_set_updated_at; Type: TRIGGER; Schema: core; Owner: postgres
--

CREATE TRIGGER trg_books_set_updated_at BEFORE UPDATE ON core.books FOR EACH ROW EXECUTE FUNCTION core.fn_set_updated_at();


--
-- TOC entry 4980 (class 2620 OID 40699)
-- Name: cart_items trg_cart_items_set_updated_at; Type: TRIGGER; Schema: core; Owner: postgres
--

CREATE TRIGGER trg_cart_items_set_updated_at BEFORE UPDATE ON core.cart_items FOR EACH ROW EXECUTE FUNCTION core.fn_set_updated_at();


--
-- TOC entry 4979 (class 2620 OID 40698)
-- Name: carts trg_carts_set_updated_at; Type: TRIGGER; Schema: core; Owner: postgres
--

CREATE TRIGGER trg_carts_set_updated_at BEFORE UPDATE ON core.carts FOR EACH ROW EXECUTE FUNCTION core.fn_set_updated_at();


--
-- TOC entry 4976 (class 2620 OID 40695)
-- Name: categories trg_categories_set_updated_at; Type: TRIGGER; Schema: core; Owner: postgres
--

CREATE TRIGGER trg_categories_set_updated_at BEFORE UPDATE ON core.categories FOR EACH ROW EXECUTE FUNCTION core.fn_set_updated_at();


--
-- TOC entry 4984 (class 2620 OID 40715)
-- Name: order_items trg_items_update_order_total; Type: TRIGGER; Schema: core; Owner: postgres
--

CREATE TRIGGER trg_items_update_order_total AFTER INSERT OR DELETE OR UPDATE ON core.order_items FOR EACH ROW EXECUTE FUNCTION core.fn_update_order_total();


--
-- TOC entry 4985 (class 2620 OID 40702)
-- Name: order_items trg_order_items_set_updated_at; Type: TRIGGER; Schema: core; Owner: postgres
--

CREATE TRIGGER trg_order_items_set_updated_at BEFORE UPDATE ON core.order_items FOR EACH ROW EXECUTE FUNCTION core.fn_set_updated_at();


--
-- TOC entry 4982 (class 2620 OID 40717)
-- Name: orders trg_orders_decrease_stock; Type: TRIGGER; Schema: core; Owner: postgres
--

CREATE TRIGGER trg_orders_decrease_stock AFTER UPDATE ON core.orders FOR EACH ROW WHEN (((old.status IS DISTINCT FROM 'diproses'::core.order_status_type) AND (new.status = 'diproses'::core.order_status_type))) EXECUTE FUNCTION core.fn_decrease_stock();


--
-- TOC entry 4983 (class 2620 OID 40701)
-- Name: orders trg_orders_set_updated_at; Type: TRIGGER; Schema: core; Owner: postgres
--

CREATE TRIGGER trg_orders_set_updated_at BEFORE UPDATE ON core.orders FOR EACH ROW EXECUTE FUNCTION core.fn_set_updated_at();


--
-- TOC entry 4986 (class 2620 OID 40719)
-- Name: payments trg_payment_notification; Type: TRIGGER; Schema: core; Owner: postgres
--

CREATE TRIGGER trg_payment_notification AFTER UPDATE ON core.payments FOR EACH ROW WHEN (((old.status IS DISTINCT FROM 'success'::core.payment_status_type) AND (new.status = 'success'::core.payment_status_type))) EXECUTE FUNCTION core.fn_create_payment_notification();


--
-- TOC entry 4987 (class 2620 OID 40703)
-- Name: payments trg_payments_set_updated_at; Type: TRIGGER; Schema: core; Owner: postgres
--

CREATE TRIGGER trg_payments_set_updated_at BEFORE UPDATE ON core.payments FOR EACH ROW EXECUTE FUNCTION core.fn_set_updated_at();


--
-- TOC entry 4974 (class 2620 OID 40693)
-- Name: publishers trg_publishers_set_updated_at; Type: TRIGGER; Schema: core; Owner: postgres
--

CREATE TRIGGER trg_publishers_set_updated_at BEFORE UPDATE ON core.publishers FOR EACH ROW EXECUTE FUNCTION core.fn_set_updated_at();


--
-- TOC entry 4978 (class 2620 OID 40697)
-- Name: user_addresses trg_user_addresses_set_updated_at; Type: TRIGGER; Schema: core; Owner: postgres
--

CREATE TRIGGER trg_user_addresses_set_updated_at BEFORE UPDATE ON core.user_addresses FOR EACH ROW EXECUTE FUNCTION core.fn_set_updated_at();


--
-- TOC entry 4973 (class 2620 OID 40692)
-- Name: user_profiles trg_user_profiles_set_updated_at; Type: TRIGGER; Schema: core; Owner: postgres
--

CREATE TRIGGER trg_user_profiles_set_updated_at BEFORE UPDATE ON core.user_profiles FOR EACH ROW EXECUTE FUNCTION core.fn_set_updated_at();


--
-- TOC entry 4981 (class 2620 OID 40700)
-- Name: wishlists trg_wishlists_set_updated_at; Type: TRIGGER; Schema: core; Owner: postgres
--

CREATE TRIGGER trg_wishlists_set_updated_at BEFORE UPDATE ON core.wishlists FOR EACH ROW EXECUTE FUNCTION core.fn_set_updated_at();


--
-- TOC entry 4955 (class 2606 OID 40504)
-- Name: book_authors book_authors_author_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.book_authors
    ADD CONSTRAINT book_authors_author_id_fkey FOREIGN KEY (author_id) REFERENCES core.authors(author_id) ON DELETE CASCADE;


--
-- TOC entry 4956 (class 2606 OID 40499)
-- Name: book_authors book_authors_book_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.book_authors
    ADD CONSTRAINT book_authors_book_id_fkey FOREIGN KEY (book_id) REFERENCES core.books(book_id) ON DELETE CASCADE;


--
-- TOC entry 4957 (class 2606 OID 40514)
-- Name: book_categories book_categories_book_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.book_categories
    ADD CONSTRAINT book_categories_book_id_fkey FOREIGN KEY (book_id) REFERENCES core.books(book_id) ON DELETE CASCADE;


--
-- TOC entry 4958 (class 2606 OID 40519)
-- Name: book_categories book_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.book_categories
    ADD CONSTRAINT book_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES core.categories(category_id) ON DELETE CASCADE;


--
-- TOC entry 4954 (class 2606 OID 40489)
-- Name: books books_publisher_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.books
    ADD CONSTRAINT books_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES core.publishers(publisher_id) ON DELETE RESTRICT;


--
-- TOC entry 4961 (class 2606 OID 40572)
-- Name: cart_items cart_items_book_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.cart_items
    ADD CONSTRAINT cart_items_book_id_fkey FOREIGN KEY (book_id) REFERENCES core.books(book_id) ON DELETE CASCADE;


--
-- TOC entry 4962 (class 2606 OID 40567)
-- Name: cart_items cart_items_cart_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES core.carts(cart_id) ON DELETE CASCADE;


--
-- TOC entry 4960 (class 2606 OID 40550)
-- Name: carts carts_user_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.carts
    ADD CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4971 (class 2606 OID 40685)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4968 (class 2606 OID 40651)
-- Name: order_items order_items_book_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.order_items
    ADD CONSTRAINT order_items_book_id_fkey FOREIGN KEY (book_id) REFERENCES core.books(book_id) ON DELETE SET NULL;


--
-- TOC entry 4969 (class 2606 OID 40646)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES core.orders(order_id) ON DELETE CASCADE;


--
-- TOC entry 4966 (class 2606 OID 40630)
-- Name: orders orders_user_address_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.orders
    ADD CONSTRAINT orders_user_address_id_fkey FOREIGN KEY (user_address_id) REFERENCES core.user_addresses(user_address_id) ON DELETE RESTRICT;


--
-- TOC entry 4967 (class 2606 OID 40625)
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE RESTRICT;


--
-- TOC entry 4970 (class 2606 OID 40670)
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES core.orders(order_id) ON DELETE RESTRICT;


--
-- TOC entry 4959 (class 2606 OID 40535)
-- Name: user_addresses user_addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.user_addresses
    ADD CONSTRAINT user_addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4953 (class 2606 OID 40434)
-- Name: user_profiles user_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.user_profiles
    ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4964 (class 2606 OID 40606)
-- Name: wishlist_items wishlist_items_book_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.wishlist_items
    ADD CONSTRAINT wishlist_items_book_id_fkey FOREIGN KEY (book_id) REFERENCES core.books(book_id) ON DELETE CASCADE;


--
-- TOC entry 4965 (class 2606 OID 40601)
-- Name: wishlist_items wishlist_items_wishlist_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.wishlist_items
    ADD CONSTRAINT wishlist_items_wishlist_id_fkey FOREIGN KEY (wishlist_id) REFERENCES core.wishlists(wishlist_id) ON DELETE CASCADE;


--
-- TOC entry 4963 (class 2606 OID 40587)
-- Name: wishlists wishlists_user_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.wishlists
    ADD CONSTRAINT wishlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5159 (class 0 OID 0)
-- Dependencies: 6
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA auth TO role_app_backend;


--
-- TOC entry 5160 (class 0 OID 0)
-- Dependencies: 7
-- Name: SCHEMA core; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA core TO role_app_backend;


--
-- TOC entry 5161 (class 0 OID 0)
-- Dependencies: 9
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO role_app_backend;


--
-- TOC entry 5162 (class 0 OID 0)
-- Dependencies: 8
-- Name: SCHEMA reporting; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA reporting TO role_app_backend;


--
-- TOC entry 5164 (class 0 OID 0)
-- Dependencies: 250
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_generate_v4() TO role_app_backend;


--
-- TOC entry 5165 (class 0 OID 0)
-- Dependencies: 221
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE auth.users TO role_app_backend;


--
-- TOC entry 5166 (class 0 OID 0)
-- Dependencies: 224
-- Name: TABLE authors; Type: ACL; Schema: core; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE core.authors TO role_app_backend;


--
-- TOC entry 5167 (class 0 OID 0)
-- Dependencies: 227
-- Name: TABLE book_authors; Type: ACL; Schema: core; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE core.book_authors TO role_app_backend;


--
-- TOC entry 5168 (class 0 OID 0)
-- Dependencies: 228
-- Name: TABLE book_categories; Type: ACL; Schema: core; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE core.book_categories TO role_app_backend;


--
-- TOC entry 5169 (class 0 OID 0)
-- Dependencies: 226
-- Name: TABLE books; Type: ACL; Schema: core; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE core.books TO role_app_backend;


--
-- TOC entry 5170 (class 0 OID 0)
-- Dependencies: 231
-- Name: TABLE cart_items; Type: ACL; Schema: core; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE core.cart_items TO role_app_backend;


--
-- TOC entry 5171 (class 0 OID 0)
-- Dependencies: 230
-- Name: TABLE carts; Type: ACL; Schema: core; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE core.carts TO role_app_backend;


--
-- TOC entry 5172 (class 0 OID 0)
-- Dependencies: 225
-- Name: TABLE categories; Type: ACL; Schema: core; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE core.categories TO role_app_backend;


--
-- TOC entry 5173 (class 0 OID 0)
-- Dependencies: 237
-- Name: TABLE notifications; Type: ACL; Schema: core; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE core.notifications TO role_app_backend;


--
-- TOC entry 5174 (class 0 OID 0)
-- Dependencies: 235
-- Name: TABLE order_items; Type: ACL; Schema: core; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE core.order_items TO role_app_backend;


--
-- TOC entry 5175 (class 0 OID 0)
-- Dependencies: 234
-- Name: TABLE orders; Type: ACL; Schema: core; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE core.orders TO role_app_backend;


--
-- TOC entry 5176 (class 0 OID 0)
-- Dependencies: 236
-- Name: TABLE payments; Type: ACL; Schema: core; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE core.payments TO role_app_backend;


--
-- TOC entry 5177 (class 0 OID 0)
-- Dependencies: 223
-- Name: TABLE publishers; Type: ACL; Schema: core; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE core.publishers TO role_app_backend;


--
-- TOC entry 5178 (class 0 OID 0)
-- Dependencies: 229
-- Name: TABLE user_addresses; Type: ACL; Schema: core; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE core.user_addresses TO role_app_backend;


--
-- TOC entry 5179 (class 0 OID 0)
-- Dependencies: 222
-- Name: TABLE user_profiles; Type: ACL; Schema: core; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE core.user_profiles TO role_app_backend;


--
-- TOC entry 5180 (class 0 OID 0)
-- Dependencies: 238
-- Name: TABLE v_book_details; Type: ACL; Schema: core; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE core.v_book_details TO role_app_backend;


--
-- TOC entry 5181 (class 0 OID 0)
-- Dependencies: 233
-- Name: TABLE wishlist_items; Type: ACL; Schema: core; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE core.wishlist_items TO role_app_backend;


--
-- TOC entry 5182 (class 0 OID 0)
-- Dependencies: 232
-- Name: TABLE wishlists; Type: ACL; Schema: core; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE core.wishlists TO role_app_backend;


--
-- TOC entry 5183 (class 0 OID 0)
-- Dependencies: 240
-- Name: TABLE mv_sales_per_day; Type: ACL; Schema: reporting; Owner: postgres
--

GRANT SELECT ON TABLE reporting.mv_sales_per_day TO role_app_backend;


--
-- TOC entry 5184 (class 0 OID 0)
-- Dependencies: 239
-- Name: TABLE v_sales_overview; Type: ACL; Schema: reporting; Owner: postgres
--

GRANT SELECT ON TABLE reporting.v_sales_overview TO role_app_backend;


--
-- TOC entry 2166 (class 826 OID 40753)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA auth GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO role_app_backend;


--
-- TOC entry 2165 (class 826 OID 40752)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: core; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA core GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO role_app_backend;


--
-- TOC entry 2167 (class 826 OID 40754)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: reporting; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA reporting GRANT SELECT ON TABLES TO role_app_backend;


--
-- TOC entry 5153 (class 0 OID 40740)
-- Dependencies: 240 5155
-- Name: mv_sales_per_day; Type: MATERIALIZED VIEW DATA; Schema: reporting; Owner: postgres
--

REFRESH MATERIALIZED VIEW reporting.mv_sales_per_day;


-- Completed on 2025-10-22 18:45:40

--
-- PostgreSQL database dump complete
--

\unrestrict LsuC4E9jQ6FN2g23dMUSp9gE1NK4mWtROPEBCUEuOndaORxLwPd2P9RPJaaaw40

