import{D as n}from"./database-type-C2NNW5SW.js";import{d as r,a,b as N}from"./code-editor-ZE9xhkVa.js";import"./index-DngGMs-x.js";import"./colors-D1Sckjvp.js";import"./theme-provider-Bg5O9Ay7.js";import"./canvas-utils-Bo482CbG.js";import"./use-storage-CxjMvB6O.js";import"./label-B61IYMRO.js";import"./link-wq2K7Eu_.js";import"./spinner-D6am5q-Y.js";import"./storage-provider-BC0RSelR.js";const S=(t={})=>{const e=t.databaseEdition,E=`
                AND connamespace::regnamespace::text NOT IN ('auth', 'extensions', 'pgsodium', 'realtime', 'storage', 'vault')
    `,s=`
                AND cols.table_schema NOT IN ('auth', 'extensions', 'pgsodium', 'realtime', 'storage', 'vault')
    `,_=`
                AND tbls.table_schema NOT IN ('auth', 'extensions', 'pgsodium', 'realtime', 'storage', 'vault')
    `,c=`
                WHERE schema_name NOT IN ('auth', 'extensions', 'pgsodium', 'realtime', 'storage', 'vault')
    `,A=`
                AND views.schemaname NOT IN ('auth', 'extensions', 'pgsodium', 'realtime', 'storage', 'vault')
    `,i=`
                AND connamespace::regnamespace::text !~ '^(timescaledb_|_timescaledb_)'
    `,l=`${`/* ${e?r[e]:"PostgreSQL"} edition */`}
WITH fk_info${e?"_"+e:""} AS (
    SELECT array_to_string(array_agg(CONCAT('{"schema":"', replace(schema_name, '"', ''), '"',
                                            ',"table":"', replace(table_name::text, '"', ''), '"',
                                            ',"column":"', replace(fk_column::text, '"', ''), '"',
                                            ',"foreign_key_name":"', foreign_key_name, '"',
                                            ',"reference_schema":"', COALESCE(reference_schema, 'public'), '"',
                                            ',"reference_table":"', reference_table, '"',
                                            ',"reference_column":"', reference_column, '"',
                                            ',"fk_def":"', replace(fk_def, '"', ''),
                                            '"}')), ',') as fk_metadata
    FROM (
            SELECT c.conname AS foreign_key_name,
                    n.nspname AS schema_name,
                    CASE
                        WHEN position('.' in conrelid::regclass::text) > 0
                        THEN split_part(conrelid::regclass::text, '.', 2)
                        ELSE conrelid::regclass::text
                    END AS table_name,
                    a.attname AS fk_column,
                    nr.nspname AS reference_schema,
                    CASE
                        WHEN position('.' in confrelid::regclass::text) > 0
                        THEN split_part(confrelid::regclass::text, '.', 2)
                        ELSE confrelid::regclass::text
                    END AS reference_table,
                    af.attname AS reference_column,
                    pg_get_constraintdef(c.oid) as fk_def
                FROM
                    pg_constraint AS c
                JOIN
                    pg_attribute AS a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
                JOIN
                    pg_class AS cl ON cl.oid = c.conrelid
                JOIN
                    pg_namespace AS n ON n.oid = cl.relnamespace
                JOIN
                    pg_attribute AS af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
                JOIN
                    pg_class AS clf ON clf.oid = c.confrelid
                JOIN
                    pg_namespace AS nr ON nr.oid = clf.relnamespace
                WHERE
                    c.contype = 'f'
                    AND connamespace::regnamespace::text NOT IN ('information_schema', 'pg_catalog')${e===a.POSTGRESQL_TIMESCALE?i:e===a.POSTGRESQL_SUPABASE?E:""}
    ) AS x
), pk_info AS (
    SELECT array_to_string(array_agg(CONCAT('{"schema":"', replace(schema_name, '"', ''), '"',
                                            ',"table":"', replace(pk_table, '"', ''), '"',
                                            ',"column":"', replace(pk_column, '"', ''), '"',
                                            ',"pk_def":"', replace(pk_def, '"', ''),
                                            '"}')), ',') AS pk_metadata
    FROM (
            SELECT connamespace::regnamespace::text AS schema_name,
                CASE
                    WHEN strpos(conrelid::regclass::text, '.') > 0
                    THEN split_part(conrelid::regclass::text, '.', 2)
                    ELSE conrelid::regclass::text
                END AS pk_table,
                unnest(string_to_array(substring(pg_get_constraintdef(oid) FROM '\\((.*?)\\)'), ',')) AS pk_column,
                pg_get_constraintdef(oid) as pk_def
            FROM
              pg_constraint
            WHERE
              contype = 'p'
              AND connamespace::regnamespace::text NOT IN ('information_schema', 'pg_catalog')${e===a.POSTGRESQL_TIMESCALE?i:e===a.POSTGRESQL_SUPABASE?E:""}
    ) AS y
),
indexes_cols AS (
    SELECT  tnsp.nspname                                                                AS schema_name,
        trel.relname                                                                    AS table_name,
            pg_relation_size('"' || tnsp.nspname || '".' || '"' || irel.relname || '"') AS index_size,
            irel.relname                                                                AS index_name,
            am.amname                                                                   AS index_type,
            a.attname                                                                   AS col_name,
            (CASE WHEN i.indisunique = TRUE THEN 'true' ELSE 'false' END)               AS is_unique,
            irel.reltuples                                                              AS cardinality,
            1 + Array_position(i.indkey, a.attnum)                                      AS column_position,
            CASE o.OPTION & 1 WHEN 1 THEN 'DESC' ELSE 'ASC' END                         AS direction,
            CASE WHEN indpred IS NOT NULL THEN 'true' ELSE 'false' END                  AS is_partial_index
    FROM pg_index AS i
        JOIN pg_class AS trel ON trel.oid = i.indrelid
        JOIN pg_namespace AS tnsp ON trel.relnamespace = tnsp.oid
        JOIN pg_class AS irel ON irel.oid = i.indexrelid
        JOIN pg_am AS am ON irel.relam = am.oid
        CROSS JOIN LATERAL unnest (i.indkey)
        WITH ORDINALITY AS c (colnum, ordinality) LEFT JOIN LATERAL unnest (i.indoption)
        WITH ORDINALITY AS o (option, ordinality)
        ON c.ordinality = o.ordinality JOIN pg_attribute AS a ON trel.oid = a.attrelid AND a.attnum = c.colnum
    WHERE tnsp.nspname NOT LIKE 'pg_%'
    GROUP BY tnsp.nspname, trel.relname, irel.relname, am.amname, i.indisunique, i.indexrelid, irel.reltuples, a.attname, Array_position(i.indkey, a.attnum), o.OPTION, i.indpred
),
cols AS (
    SELECT array_to_string(array_agg(CONCAT('{"schema":"', cols.table_schema,
                                            '","table":"', cols.table_name,
                                            '","name":"', cols.column_name,
                                            '","ordinal_position":"', cols.ordinal_position,
                                            '","type":"', LOWER(replace(cols.data_type, '"', '')),
                                            '","character_maximum_length":"', COALESCE(cols.character_maximum_length::text, 'null'),
                                            '","precision":',
                                                CASE
                                                    WHEN cols.data_type = 'numeric' OR cols.data_type = 'decimal'
                                                    THEN CONCAT('{"precision":', COALESCE(cols.numeric_precision::text, 'null'),
                                                                ',"scale":', COALESCE(cols.numeric_scale::text, 'null'), '}')
                                                    ELSE 'null'
                                                END,
                                            ',"nullable":', CASE WHEN (cols.IS_NULLABLE = 'YES') THEN 'true' ELSE 'false' END,
                                            ',"default":"', COALESCE(replace(replace(cols.column_default, '"', '\\"'), '\\x', '\\\\x'), ''),
                                            '","collation":"', COALESCE(cols.COLLATION_NAME, ''),
                                            '","comment":"', COALESCE(replace(replace(dsc.description, '"', '\\"'), '\\x', '\\\\x'), ''),
                                            '"}')), ',') AS cols_metadata
    FROM information_schema.columns cols
    LEFT JOIN pg_catalog.pg_class c
        ON c.relname = cols.table_name
    JOIN pg_catalog.pg_namespace n
        ON n.oid = c.relnamespace AND n.nspname = cols.table_schema
    LEFT JOIN pg_catalog.pg_description dsc ON dsc.objoid = c.oid
                                        AND dsc.objsubid = cols.ordinal_position
    WHERE cols.table_schema NOT IN ('information_schema', 'pg_catalog')${e===a.POSTGRESQL_TIMESCALE?`
                AND cols.table_schema !~ '^(timescaledb_|_timescaledb_)'
                AND cols.table_name !~ '^(pg_stat_)'
    `:e===a.POSTGRESQL_SUPABASE?s:""}
), indexes_metadata AS (
    SELECT array_to_string(array_agg(CONCAT('{"schema":"', schema_name,
                                            '","table":"', table_name,
                                            '","name":"', index_name,
                                            '","column":"', replace(col_name :: TEXT, '"', E'"'),
                                            '","index_type":"', index_type,
                                            '","cardinality":', cardinality,
                                            ',"size":', index_size,
                                            ',"unique":', is_unique,
                                            ',"is_partial_index":', is_partial_index,
                                            ',"column_position":', column_position,
                                            ',"direction":"', LOWER(direction),
                                            '"}')), ',') AS indexes_metadata
    FROM indexes_cols x ${e===a.POSTGRESQL_TIMESCALE?`
                WHERE schema_name !~ '^(timescaledb_|_timescaledb_)'
    `:e===a.POSTGRESQL_SUPABASE?c:""}
), tbls AS (
    SELECT array_to_string(array_agg(CONCAT('{',
                        '"schema":"', tbls.TABLE_SCHEMA, '",',
                        '"table":"', tbls.TABLE_NAME, '",',
                        '"rows":', COALESCE((SELECT s.n_live_tup
                                                FROM pg_stat_user_tables s
                                                WHERE tbls.TABLE_SCHEMA = s.schemaname AND tbls.TABLE_NAME = s.relname),
                                                0), ', "type":"', tbls.TABLE_TYPE, '",', '"engine":"",', '"collation":"",',
                        '"comment":"', COALESCE(replace(replace(dsc.description, '"', '\\"'), '\\x', '\\\\x'), ''),
                        '"}'
                )),
                ',') AS tbls_metadata
        FROM information_schema.tables tbls
        LEFT JOIN pg_catalog.pg_class c ON c.relname = tbls.TABLE_NAME
        JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
                                            AND n.nspname = tbls.TABLE_SCHEMA
        LEFT JOIN pg_catalog.pg_description dsc ON dsc.objoid = c.oid
                                                AND dsc.objsubid = 0
        WHERE tbls.TABLE_SCHEMA NOT IN ('information_schema', 'pg_catalog') ${e===a.POSTGRESQL_TIMESCALE?`
                AND tbls.table_schema !~ '^(timescaledb_|_timescaledb_)'
                AND tbls.table_name !~ '^(pg_stat_)'
    `:e===a.POSTGRESQL_SUPABASE?_:""}
), config AS (
    SELECT array_to_string(
                      array_agg(CONCAT('{"name":"', conf.name, '","value":"', replace(conf.setting, '"', E'"'), '"}')),
                      ',') AS config_metadata
    FROM pg_settings conf
), views AS (
    SELECT array_to_string(array_agg(CONCAT('{"schema":"', views.schemaname,
                      '","view_name":"', viewname,
                      '","view_definition":"', encode(convert_to(REPLACE(definition, '"', '\\"'), 'UTF8'), 'base64'),
                    '"}')),
                      ',') AS views_metadata
    FROM pg_views views
    WHERE views.schemaname NOT IN ('information_schema', 'pg_catalog') ${e===a.POSTGRESQL_TIMESCALE?`
                AND views.schemaname !~ '^(timescaledb_|_timescaledb_)'
    `:e===a.POSTGRESQL_SUPABASE?A:""}
)
SELECT CONCAT('{    "fk_info": [', COALESCE(fk_metadata, ''),
                    '], "pk_info": [', COALESCE(pk_metadata, ''),
                    '], "columns": [', COALESCE(cols_metadata, ''),
                    '], "indexes": [', COALESCE(indexes_metadata, ''),
                    '], "tables":[', COALESCE(tbls_metadata, ''),
                    '], "views":[', COALESCE(views_metadata, ''),
                    '], "database_name": "', CURRENT_DATABASE(), '', '", "version": "', '',
              '"}') AS metadata_json_to_import
FROM fk_info${e?"_"+e:""}, pk_info, cols, indexes_metadata, tbls, config, views;
    `,m=`# *** Remember to change! (HOST_NAME, PORT, USER_NAME, DATABASE_NAME) *** 
`;return t.databaseClient===N.POSTGRESQL_PSQL?`${m}psql -h HOST_NAME -p PORT -U USER_NAME -d DATABASE_NAME -c "
${l.replace(/"/g,'\\"').replace(/\\\\/g,"\\\\\\").replace(/\\x/g,"\\\\x")}
" -t -A > output.json;`:l},L=(t={})=>t.databaseEdition===a.MYSQL_5_7?`SET SESSION group_concat_max_len = 1000000; -- large enough value to handle your expected result size
SELECT CAST(CONCAT(
    '{"fk_info": [',
    IFNULL((SELECT GROUP_CONCAT(
        CONCAT('{"schema":"', cast(fk.table_schema as CHAR),
               '","table":"', fk.table_name,
               '","column":"', IFNULL(fk.fk_column, ''),
               '","foreign_key_name":"', IFNULL(fk.foreign_key_name, ''),
               '","reference_table":"', IFNULL(fk.reference_table, ''),
               '","reference_schema":"', IFNULL(fk.reference_schema, ''),
               '","reference_column":"', IFNULL(fk.reference_column, ''),
               '","fk_def":"', IFNULL(fk.fk_def, ''), '"}')
    ) FROM (
        SELECT kcu.table_schema,
               kcu.table_name,
               kcu.column_name AS fk_column,
               kcu.constraint_name AS foreign_key_name,
               kcu.referenced_table_schema as reference_schema,
               kcu.referenced_table_name AS reference_table,
               kcu.referenced_column_name AS reference_column,
               CONCAT('FOREIGN KEY (', kcu.column_name, ') REFERENCES ',
                      kcu.referenced_table_name, '(', kcu.referenced_column_name, ') ',
                      'ON UPDATE ', rc.update_rule,
                      ' ON DELETE ', rc.delete_rule) AS fk_def
        FROM information_schema.key_column_usage kcu
        JOIN information_schema.referential_constraints rc
          ON kcu.constraint_name = rc.constraint_name
         AND kcu.table_schema = rc.constraint_schema
         AND kcu.table_name = rc.table_name
        WHERE kcu.referenced_table_name IS NOT NULL
          AND kcu.table_schema = DATABASE()
    ) AS fk), ''),
    '], "pk_info": [',
    IFNULL((SELECT GROUP_CONCAT(
        CONCAT('{"schema":"', cast(pk.TABLE_SCHEMA as CHAR),
               '","table":"', pk.pk_table,
               '","column":"', pk.pk_column,
               '","pk_def":"', IFNULL(pk.pk_def, ''), '"}')
    ) FROM (
        SELECT TABLE_SCHEMA,
               TABLE_NAME AS pk_table,
               COLUMN_NAME AS pk_column,
               (SELECT CONCAT('PRIMARY KEY (', GROUP_CONCAT(inc.COLUMN_NAME ORDER BY inc.ORDINAL_POSITION SEPARATOR ', '), ')')
                               FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE as inc
                               WHERE inc.CONSTRAINT_NAME = 'PRIMARY' and
                                     outc.TABLE_SCHEMA = inc.TABLE_SCHEMA and
                                     outc.TABLE_NAME = inc.TABLE_NAME) AS pk_def
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE as outc
        WHERE CONSTRAINT_NAME = 'PRIMARY'
              and table_schema LIKE IFNULL(NULL, '%')
              AND table_schema = DATABASE()
        GROUP BY TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME
    ) AS pk), ''),
    '], "columns": [',
    IFNULL((SELECT GROUP_CONCAT(
        CONCAT('{"schema":"', cast(cols.table_schema as CHAR),
               '","table":"', cols.table_name,
               '","name":"', REPLACE(cols.column_name, '"', '\\"'),
               '","type":"', LOWER(cols.data_type),
               '","character_maximum_length":"', IFNULL(cols.character_maximum_length, 'null'),
               '","precision":',
               IF(cols.data_type IN ('decimal', 'numeric'),
                  CONCAT('{"precision":', IFNULL(cols.numeric_precision, 'null'),
                         ',"scale":', IFNULL(cols.numeric_scale, 'null'), '}'), 'null'),
               ',"ordinal_position":"', cols.ordinal_position,
               '","nullable":', IF(cols.is_nullable = 'YES', 'true', 'false'),
               ',"default":"', IFNULL(REPLACE(REPLACE(cols.column_default, '\\\\', ''), '"', '\\"'), ''),
               '","collation":"', IFNULL(cols.collation_name, ''), '"}')
    ) FROM (
        SELECT cols.table_schema,
               cols.table_name,
               cols.column_name,
               LOWER(cols.data_type) AS data_type,
               cols.character_maximum_length,
               cols.numeric_precision,
               cols.numeric_scale,
               cols.ordinal_position,
               cols.is_nullable,
               cols.column_default,
               cols.collation_name
        FROM information_schema.columns cols
        WHERE cols.table_schema = DATABASE()
    ) AS cols), ''),
    '], "indexes": [',
    IFNULL((SELECT GROUP_CONCAT(
        CONCAT('{"schema":"', cast(idx.table_schema as CHAR),
               '","table":"', idx.table_name,
               '","name":"', idx.index_name,
               '","size":"', IFNULL(
                    (SELECT SUM(stat_value * @@innodb_page_size)
                     FROM mysql.innodb_index_stats
                     WHERE stat_name = 'size'
                       AND index_name != 'PRIMARY'
                       AND index_name = idx.index_name
                       AND TABLE_NAME = idx.table_name
                       AND database_name = idx.table_schema), -1),
               '","column":"', idx.column_name,
               '","index_type":"', LOWER(idx.index_type),
               '","cardinality":', idx.cardinality,
               ',"direction":"', (CASE WHEN idx.collation = 'D' THEN 'desc' ELSE 'asc' END),
               '","column_position":', idx.seq_in_index,
               ',"unique":', IF(idx.non_unique = 1, 'false', 'true'), '}')
    ) FROM (
        SELECT indexes.table_schema,
               indexes.table_name,
               indexes.index_name,
               indexes.column_name,
               LOWER(indexes.index_type) AS index_type,
               indexes.cardinality,
               indexes.collation,
               indexes.non_unique,
               indexes.seq_in_index
        FROM information_schema.statistics indexes
        WHERE indexes.table_schema = DATABASE()
    ) AS idx), ''),
    '], "tables":[',
    IFNULL((SELECT GROUP_CONCAT(
        CONCAT('{"schema":"', cast(tbls.TABLE_SCHEMA as CHAR),
               '","table":"', tbls.TABLE_NAME,
               '","rows":', IFNULL(tbls.TABLE_ROWS, 0),
               ',"type":"', IFNULL(tbls.TABLE_TYPE, ''),
               '","engine":"', IFNULL(tbls.ENGINE, ''),
               '","collation":"', IFNULL(tbls.TABLE_COLLATION, ''), '"}')
    ) FROM (
        SELECT \`TABLE_SCHEMA\`,
               \`TABLE_NAME\`,
               \`TABLE_ROWS\`,
               \`TABLE_TYPE\`,
               \`ENGINE\`,
               \`TABLE_COLLATION\`
        FROM information_schema.tables tbls
        WHERE tbls.table_schema = DATABASE()
    ) AS tbls), ''),
    '], "views":[',
    IFNULL((SELECT GROUP_CONCAT(
        CONCAT('{"schema":"', cast(vws.TABLE_SCHEMA as CHAR),
               '","view_name":"', vws.view_name,
               '","view_definition":"', view_definition, '"}')
    ) FROM (
        SELECT \`TABLE_SCHEMA\`,
               \`TABLE_NAME\` AS view_name,
               REPLACE(REPLACE(TO_BASE64(\`VIEW_DEFINITION\`), ' ', ''), '
', '') AS view_definition
        FROM information_schema.views vws
        WHERE vws.table_schema = DATABASE()
    ) AS vws), ''),
    '], "database_name": "', DATABASE(),
    '", "version": "', VERSION(), '"}') AS CHAR) AS metadata_json_to_import
`:`WITH fk_info as (
(SELECT (@fk_info:=NULL),
    (SELECT (0)
    FROM (SELECT kcu.table_schema,
        kcu.table_name,
        kcu.column_name as fk_column,
        kcu.constraint_name as foreign_key_name,
        kcu.referenced_table_schema as reference_schema,
        kcu.referenced_table_name as reference_table,
        kcu.referenced_column_name as reference_column,
        CONCAT('FOREIGN KEY (', kcu.column_name, ') REFERENCES ',
            kcu.referenced_table_name, '(', kcu.referenced_column_name, ') ',
            'ON UPDATE ', rc.update_rule,
            ' ON DELETE ', rc.delete_rule) AS fk_def
    FROM
        information_schema.key_column_usage kcu
    JOIN
        information_schema.referential_constraints rc
        ON kcu.constraint_name = rc.constraint_name
            AND kcu.table_schema = rc.constraint_schema
        AND kcu.table_name = rc.table_name
    WHERE
        kcu.referenced_table_name IS NOT NULL) as fk
    WHERE table_schema LIKE IFNULL(NULL, '%')
        AND table_schema = DATABASE()
        AND (0x00) IN (@fk_info:=CONCAT_WS(',', @fk_info, CONCAT('{"schema":"',table_schema,
                                    '","table":"',table_name,
                                    '","column":"', IFNULL(fk_column, ''),
                                                '","foreign_key_name":"', IFNULL(foreign_key_name, ''),
                                                '","reference_schema":"', IFNULL(reference_schema, ''),
                                                '","reference_table":"', IFNULL(reference_table, ''),
                                                '","reference_column":"', IFNULL(reference_column, ''),
                                                '","fk_def":"', IFNULL(fk_def, ''),
                                    '"}')))))
), pk_info AS (
    (SELECT (@pk_info:=NULL),
              (SELECT (0)
               FROM (SELECT TABLE_SCHEMA,
                            TABLE_NAME AS pk_table,
                            COLUMN_NAME AS pk_column,
                            (SELECT CONCAT('PRIMARY KEY (', GROUP_CONCAT(inc.COLUMN_NAME ORDER BY inc.ORDINAL_POSITION SEPARATOR ', '), ')')
                               FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE as inc
                               WHERE inc.CONSTRAINT_NAME = 'PRIMARY' and
                                     outc.TABLE_SCHEMA = inc.TABLE_SCHEMA and
                             		 outc.TABLE_NAME = inc.TABLE_NAME) AS pk_def
                       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE as outc
                       WHERE CONSTRAINT_NAME = 'PRIMARY'
                       GROUP BY TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME
                       ORDER BY TABLE_SCHEMA, TABLE_NAME, MIN(ORDINAL_POSITION)) AS pk
               WHERE table_schema LIKE IFNULL(NULL, '%')
               AND table_schema = DATABASE()
               AND (0x00) IN (@pk_info:=CONCAT_WS(',', @pk_info, CONCAT('{"schema":"', table_schema,
                                                                        '","table":"', pk_table,
                                                                        '","column":"', pk_column,
                                                                        '","pk_def":"', IFNULL(pk_def, ''),
                                                                        '"}')))))
), cols as
(
  (SELECT (@cols := NULL),
        (SELECT (0)
         FROM information_schema.columns cols
         WHERE cols.table_schema LIKE IFNULL(NULL, '%')
           AND cols.table_schema = DATABASE()
           AND (0x00) IN (@cols := CONCAT_WS(',', @cols, CONCAT(
                '{"schema":"', cols.table_schema,
                '","table":"', cols.table_name,
                '","name":"', REPLACE(cols.column_name, '"', '\\"'),
                '","type":"', LOWER(cols.data_type),
                '","character_maximum_length":"', IFNULL(cols.character_maximum_length, 'null'),
                '","precision":',
                    CASE
                        WHEN cols.data_type IN ('decimal', 'numeric')
                        THEN CONCAT('{"precision":', IFNULL(cols.numeric_precision, 'null'),
                                    ',"scale":', IFNULL(cols.numeric_scale, 'null'), '}')
                        ELSE 'null'
                    END,
                ',"ordinal_position":"', cols.ordinal_position,
                '","nullable":', IF(cols.is_nullable = 'YES', 'true', 'false'),
                ',"default":"', IFNULL(REPLACE(REPLACE(cols.column_default, '\\\\', ''), '"', 'ֿֿֿ\\"'), ''),
                '","collation":"', IFNULL(cols.collation_name, ''), '"}'
            )))))
), indexes as (
  (SELECT (@indexes:=NULL),
                (SELECT (0)
                 FROM information_schema.statistics indexes
                 WHERE table_schema LIKE IFNULL(NULL, '%')
                     AND table_schema = DATABASE()
                     AND (0x00) IN  (@indexes:=CONCAT_WS(',', @indexes, CONCAT('{"schema":"',indexes.table_schema,
                                         '","table":"',indexes.table_name,
                                         '","name":"', indexes.index_name,
                                         '","size":"',
                                                                      (SELECT IFNULL(SUM(stat_value * @@innodb_page_size), -1) AS size_in_bytes
                                                                       FROM mysql.innodb_index_stats
                                                                       WHERE stat_name = 'size'
                                                                           AND index_name != 'PRIMARY'
                                                                           AND index_name = indexes.index_name
                                                                           AND TABLE_NAME = indexes.table_name
                                                                           AND database_name = indexes.table_schema),
                                                                  '","column":"', indexes.column_name,
                                                      '","index_type":"', LOWER(indexes.index_type),
                                                      '","cardinality":', indexes.cardinality,
                                                      ',"direction":"', (CASE WHEN indexes.collation = 'D' THEN 'desc' ELSE 'asc' END),
                                                      '","column_position":', indexes.seq_in_index,
                                                      ',"unique":', IF(indexes.non_unique = 1, 'false', 'true'), '}')))))
), tbls as
(
  (SELECT (@tbls:=NULL),
              (SELECT (0)
               FROM information_schema.tables tbls
               WHERE table_schema LIKE IFNULL(NULL, '%')
                   AND table_schema = DATABASE()
                   AND (0x00) IN (@tbls:=CONCAT_WS(',', @tbls, CONCAT('{', '"schema":"', \`TABLE_SCHEMA\`, '",',
                                               '"table":"', \`TABLE_NAME\`, '",',
                                             '"rows":', IFNULL(\`TABLE_ROWS\`, 0),
                                             ', "type":"', IFNULL(\`TABLE_TYPE\`, ''), '",',
                                             '"engine":"', IFNULL(\`ENGINE\`, ''), '",',
                                             '"collation":"', IFNULL(\`TABLE_COLLATION\`, ''), '"}')))))
), views as (
(SELECT (@views:=NULL),
              (SELECT (0)
               FROM information_schema.views views
               WHERE table_schema LIKE IFNULL(NULL, '%')
                   AND table_schema = DATABASE()
                   AND (0x00) IN (@views:=CONCAT_WS(',', @views, CONCAT('{', '"schema":"', \`TABLE_SCHEMA\`, '",',
                                                   '"view_name":"', \`TABLE_NAME\`, '",',
                                                   '"view_definition":"', REPLACE(REPLACE(TO_BASE64(VIEW_DEFINITION), ' ', ''), '
', ''), '"}'))) ) )
)
(SELECT CAST(CONCAT('{"fk_info": [',IFNULL(@fk_info,''),
                '], "pk_info": [', IFNULL(@pk_info, ''),
            '], "columns": [',IFNULL(@cols,''),
            '], "indexes": [',IFNULL(@indexes,''),
            '], "tables":[',IFNULL(@tbls,''),
            '], "views":[',IFNULL(@views,''),
            '], "database_name": "', DATABASE(),
            '", "version": "', VERSION(), '"}') AS CHAR) AS metadata_json_to_import
 FROM fk_info, pk_info, cols, indexes, tbls, views);
`,C=`WITH fk_info AS (
  SELECT
      json_group_array(
          json_object(
              'schema', '',  -- SQLite does not have schemas
              'table', m.name,
              'column', fk."from",
              'foreign_key_name',
                  'fk_' || m.name || '_' || fk."from" || '_' || fk."table" || '_' || fk."to",  -- Generated foreign key name
              'reference_schema', '', -- SQLite does not have schemas
              'reference_table', fk."table",
              'reference_column', fk."to",
              'fk_def',
                  'FOREIGN KEY (' || fk."from" || ') REFERENCES ' || fk."table" || '(' || fk."to" || ')' ||
                  ' ON UPDATE ' || fk.on_update || ' ON DELETE ' || fk.on_delete
          )
      ) AS fk_metadata
  FROM
      sqlite_master m
  JOIN
      pragma_foreign_key_list(m.name) fk
  ON
      m.type = 'table'
), pk_info AS (
  SELECT
      json_group_array(
          json_object(
              'schema', '',  -- SQLite does not have schemas
              'table', pk.table_name,
              'field_count', pk.field_count,
              'column', pk.pk_column,
              'pk_def', 'PRIMARY KEY (' || pk.pk_column || ')'
          )
      ) AS pk_metadata
  FROM
  (
      SELECT
          m.name AS table_name,
          COUNT(p.name) AS field_count,  -- Count of primary key columns
          GROUP_CONCAT(p.name) AS pk_column  -- Concatenated list of primary key columns
      FROM
          sqlite_master m
      JOIN
          pragma_table_info(m.name) p
      ON
          m.type = 'table' AND p.pk > 0
      GROUP BY
          m.name
  ) pk
), indexes_metadata AS (
  SELECT
      json_group_array(
          json_object(
              'schema', '',  -- SQLite does not have schemas
              'table', m.name,
              'name', idx.name,
              'column', ic.name,
              'index_type', 'B-TREE',  -- SQLite uses B-Trees for indexing
              'cardinality', '',  -- SQLite does not provide cardinality
              'size', '',  -- SQLite does not provide index size
              'unique', (CASE WHEN idx."unique" = 1 THEN 'true' ELSE 'false' END),
              'direction', '',  -- SQLite does not provide direction info
              'column_position', ic.seqno + 1  -- Adding 1 to convert from zero-based to one-based index
          )
      ) AS indexes_metadata
  FROM
      sqlite_master m
  JOIN
      pragma_index_list(m.name) idx
  ON
      m.type = 'table'
  JOIN
      pragma_index_info(idx.name) ic
), cols AS (
  SELECT
      json_group_array(
          json_object(
              'schema', '',  -- SQLite does not have schemas
              'table', m.name,
              'name', p.name,
              'type',
                  CASE
                      WHEN INSTR(LOWER(p.type), '(') > 0 THEN
                          SUBSTR(LOWER(p.type), 1, INSTR(LOWER(p.type), '(') - 1)
                      ELSE LOWER(p.type)
                  END,
              'ordinal_position', p.cid,
              'nullable', (CASE WHEN p."notnull" = 0 THEN true ELSE false END),
              'collation', '',
              'character_maximum_length',
                  CASE
                      WHEN LOWER(p.type) LIKE 'char%' OR LOWER(p.type) LIKE 'varchar%' THEN
                          CASE
                              WHEN INSTR(p.type, '(') > 0 THEN
                                  REPLACE(SUBSTR(p.type, INSTR(p.type, '(') + 1, LENGTH(p.type) - INSTR(p.type, '(') - 1), ')', '')
                              ELSE 'null'
                          END
                      ELSE 'null'
                  END,
              'precision',
              CASE
                  WHEN LOWER(p.type) LIKE 'decimal%' OR LOWER(p.type) LIKE 'numeric%' THEN
                      CASE
                          WHEN instr(p.type, '(') > 0 THEN
                              json_object(
                                  'precision', substr(p.type, instr(p.type, '(') + 1, instr(p.type, ',') - instr(p.type, '(') - 1),
                                  'scale', substr(p.type, instr(p.type, ',') + 1, instr(p.type, ')') - instr(p.type, ',') - 1)
                              )
                          ELSE 'null'
                      END
                  ELSE 'null'
              END,
              'default', COALESCE(REPLACE(p.dflt_value, '"', '\\"'), '')
          )
      ) AS cols_metadata
  FROM
      sqlite_master m
  JOIN
      pragma_table_info(m.name) p
  ON
      m.type in ('table', 'view')
), tbls AS (
  SELECT
      json_group_array(
          json_object(
              'schema', '',  -- SQLite does not have schemas
              'table', m.name,
              'rows', -1,
              'type', 'table',
              'engine', '',  -- SQLite does not use storage engines
              'collation', ''  -- Collation information is not available
          )
      ) AS tbls_metadata
  FROM
      sqlite_master m
  WHERE
      m.type in ('table', 'view')
), views AS (
  SELECT
      json_group_array(
          json_object(
              'schema', '',
              'view_name', m.name
          )
      ) AS views_metadata
  FROM
      sqlite_master m
  WHERE
      m.type = 'view'
)
SELECT
replace(replace(replace(
      json_object(
          'fk_info', (SELECT fk_metadata FROM fk_info),
          'pk_info', (SELECT pk_metadata FROM pk_info),
          'columns', (SELECT cols_metadata FROM cols),
          'indexes', (SELECT indexes_metadata FROM indexes_metadata),
          'tables', (SELECT tbls_metadata FROM tbls),
          'views', (SELECT views_metadata FROM views),
          'database_name', 'sqlite',
          'version', sqlite_version()
      ),
      '\\"', '"'),'"[', '['), ']"', ']'
) AS metadata_json_to_import;
`,T=`/* SQL Server 2017 and above edition (14.0, 15.0, 16.0, 17.0)*/
WITH fk_info AS (
    SELECT
        JSON_QUERY(
            N'[' + STRING_AGG(
                CONVERT(nvarchar(max),
                    JSON_QUERY(N'{
                        "schema": "' + STRING_ESCAPE(COALESCE(REPLACE(tp_schema.name, '"', ''), ''), 'json') +
                        '", "table": "' + STRING_ESCAPE(COALESCE(REPLACE(tp.name, '"', ''), ''), 'json') +
                        '", "column": "' + STRING_ESCAPE(COALESCE(REPLACE(cp.name, '"', ''), ''), 'json') +
                        '", "foreign_key_name": "' + STRING_ESCAPE(COALESCE(REPLACE(fk.name, '"', ''), ''), 'json') +
                        '", "reference_schema": "' + STRING_ESCAPE(COALESCE(REPLACE(tr_schema.name, '"', ''), ''), 'json') +
                        '", "reference_table": "' + STRING_ESCAPE(COALESCE(REPLACE(tr.name, '"', ''), ''), 'json') +
                        '", "reference_column": "' + STRING_ESCAPE(COALESCE(REPLACE(cr.name, '"', ''), ''), 'json') +
                        '", "fk_def": "FOREIGN KEY (' + STRING_ESCAPE(COALESCE(REPLACE(cp.name, '"', ''), ''), 'json') +
                        ') REFERENCES ' + STRING_ESCAPE(COALESCE(REPLACE(tr.name, '"', ''), ''), 'json') +
                        '(' + STRING_ESCAPE(COALESCE(REPLACE(cr.name, '"', ''), ''), 'json') +
                        ') ON DELETE ' + STRING_ESCAPE(fk.delete_referential_action_desc, 'json') +
                        ' ON UPDATE ' + STRING_ESCAPE(fk.update_referential_action_desc, 'json') +
                    '"}') COLLATE DATABASE_DEFAULT
                ), N','
            ) + N']'
        ) AS all_fks_json
    FROM sys.foreign_keys AS fk
    JOIN sys.foreign_key_columns AS fkc ON fk.object_id = fkc.constraint_object_id
    JOIN sys.tables AS tp ON fkc.parent_object_id = tp.object_id
    JOIN sys.schemas AS tp_schema ON tp.schema_id = tp_schema.schema_id
    JOIN sys.columns AS cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
    JOIN sys.tables AS tr ON fkc.referenced_object_id = tr.object_id
    JOIN sys.schemas AS tr_schema ON tr.schema_id = tr_schema.schema_id
    JOIN sys.columns AS cr ON fkc.referenced_object_id = cr.object_id AND fkc.referenced_column_id = cr.column_id
), pk_info AS (
    SELECT
        JSON_QUERY(
            N'[' +
                STRING_AGG(
                    CONVERT(nvarchar(max),
                        JSON_QUERY(N'{
                            "schema": "' + STRING_ESCAPE(COALESCE(REPLACE(pk.TABLE_SCHEMA, '"', ''), ''), 'json') +
                            '", "table": "' + STRING_ESCAPE(COALESCE(REPLACE(pk.TABLE_NAME, '"', ''), ''), 'json') +
                            '", "column": "' + STRING_ESCAPE(COALESCE(REPLACE(pk.COLUMN_NAME, '"', ''), ''), 'json') +
                            '", "pk_def": "PRIMARY KEY (' + STRING_ESCAPE(pk.COLUMN_NAME, 'json') + N')"}') COLLATE DATABASE_DEFAULT
                        ), N','
                ) + N']'
        ) AS all_pks_json
    FROM (
        SELECT
            kcu.TABLE_SCHEMA,
            kcu.TABLE_NAME,
            kcu.COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
        JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
            ON kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
            AND kcu.CONSTRAINT_SCHEMA = tc.CONSTRAINT_SCHEMA
        WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
    ) pk
),
cols AS (
    SELECT
        JSON_QUERY(N'[' +
            STRING_AGG(
                CONVERT(nvarchar(max),
                    JSON_QUERY(N'{
                        "schema": "' + STRING_ESCAPE(COALESCE(REPLACE(cols.TABLE_SCHEMA, '"', ''), ''), 'json') +
                        '", "table": "' + STRING_ESCAPE(COALESCE(REPLACE(cols.TABLE_NAME, '"', ''), ''), 'json') +
                        '", "name": "' + STRING_ESCAPE(COALESCE(REPLACE(cols.COLUMN_NAME, '"', ''), ''), 'json') +
                        '", "ordinal_position": ' + CAST(cols.ORDINAL_POSITION AS NVARCHAR(MAX)) +
                        ', "type": "' + STRING_ESCAPE(LOWER(cols.DATA_TYPE), 'json') +
                        '", "character_maximum_length": ' +
                            CASE
                                WHEN cols.CHARACTER_MAXIMUM_LENGTH IS NULL THEN 'null'
                                ELSE CAST(cols.CHARACTER_MAXIMUM_LENGTH AS NVARCHAR(MAX))
                            END +
                        ', "precision": ' +
                            CASE
                                WHEN cols.DATA_TYPE IN ('numeric', 'decimal')
                                THEN '{"precision":' + COALESCE(CAST(cols.NUMERIC_PRECISION AS NVARCHAR(MAX)), 'null') +
                                     ',"scale":' + COALESCE(CAST(cols.NUMERIC_SCALE AS NVARCHAR(MAX)), 'null') + '}'
                                ELSE 'null'
                            END +
                        ', "nullable": ' + CASE WHEN cols.IS_NULLABLE = 'YES' THEN 'true' ELSE 'false' END +
                        ', "default": ' +
                            '"' + STRING_ESCAPE(COALESCE(REPLACE(CAST(cols.COLUMN_DEFAULT AS NVARCHAR(MAX)), '"', '\\"'), ''), 'json') + '"' +
                        ', "collation": ' + CASE
                            WHEN cols.COLLATION_NAME IS NULL THEN 'null'
                            ELSE '"' + STRING_ESCAPE(cols.COLLATION_NAME, 'json') + '"'
                        END +
                    N'}') COLLATE DATABASE_DEFAULT
                ), N','
            ) +
        N']') AS all_columns_json
    FROM INFORMATION_SCHEMA.COLUMNS cols
    WHERE cols.TABLE_CATALOG = DB_NAME()
),
indexes AS (
    SELECT
        N'[' +
            STRING_AGG(
                CONVERT(nvarchar(max),
                    JSON_QUERY(N'{
                        "schema": "' + STRING_ESCAPE(COALESCE(REPLACE(s.name, '"', ''), ''), 'json') +
                        '", "table": "' + STRING_ESCAPE(COALESCE(REPLACE(t.name, '"', ''), ''), 'json') +
                        '", "name": "' + STRING_ESCAPE(COALESCE(REPLACE(i.name, '"', ''), ''), 'json') +
                        '", "column": "' + STRING_ESCAPE(COALESCE(REPLACE(c.name, '"', ''), ''), 'json') +
                        '", "index_type": "' + STRING_ESCAPE(LOWER(i.type_desc), 'json') +
                        '", "unique": ' + CASE WHEN i.is_unique = 1 THEN 'true' ELSE 'false' END +
                        ', "direction": "' + CASE WHEN ic.is_descending_key = 1 THEN 'desc' ELSE 'asc' END +
                        '", "column_position": ' + CAST(ic.key_ordinal AS nvarchar(max)) + N'}'
                    ) COLLATE DATABASE_DEFAULT
                ), N','
            ) +
        N']' AS all_indexes_json
    FROM sys.indexes i
    JOIN sys.tables t ON i.object_id = t.object_id
    JOIN sys.schemas s ON t.schema_id = s.schema_id
    JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
    JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
    WHERE s.name LIKE '%' AND i.name IS NOT NULL AND ic.is_included_column = 0
),
tbls AS (
    SELECT
        N'[' + STRING_AGG(
                CONVERT(nvarchar(max),
                        JSON_QUERY(N'{
                            "schema": "' + STRING_ESCAPE(COALESCE(REPLACE(aggregated.schema_name, '"', ''), ''), 'json') +
                            '", "table": "' + STRING_ESCAPE(COALESCE(REPLACE(aggregated.table_name, '"', ''), ''), 'json') +
                            '", "row_count": ' + CAST(aggregated.row_count AS NVARCHAR(MAX)) +
                            ', "table_type": "' + STRING_ESCAPE(aggregated.table_type, 'json') +
                            '", "creation_date": "' + CONVERT(NVARCHAR(MAX), aggregated.creation_date, 120) + N'"}'
                        ) COLLATE DATABASE_DEFAULT
                    ), N','
                ) +
        N']' AS all_tables_json
    FROM (
        SELECT
            COALESCE(REPLACE(s.name, '"', ''), '') AS schema_name,
            COALESCE(REPLACE(t.name, '"', ''), '') AS table_name,
            SUM(p.rows) AS row_count,
            t.type_desc AS table_type,
            t.create_date AS creation_date
        FROM sys.tables t
        JOIN sys.schemas s ON t.schema_id = s.schema_id
        JOIN sys.partitions p ON t.object_id = p.object_id AND p.index_id IN (0, 1)
        WHERE s.name LIKE '%'
        GROUP BY s.name, t.name, t.type_desc, t.create_date

        UNION ALL

        SELECT
            COALESCE(REPLACE(s.name, '"', ''), '') AS table_name,
            COALESCE(REPLACE(v.name, '"', ''), '') AS object_name,
            0 AS row_count,
            'VIEW' AS table_type,
            v.create_date AS creation_date
        FROM sys.views v
        JOIN sys.schemas s ON v.schema_id = s.schema_id
        WHERE s.name LIKE '%'
    ) AS aggregated
),
views AS (
    SELECT
        '[' + STRING_AGG(
                CONVERT(nvarchar(max),
                JSON_QUERY(N'{
                    "schema": "' + STRING_ESCAPE(COALESCE(REPLACE(s.name, '"', ''), ''), 'json') +
                    '", "view_name": "' + STRING_ESCAPE(COALESCE(REPLACE(v.name, '"', ''), ''), 'json') +
                    '", "view_definition": "' +
                    STRING_ESCAPE(
                        CAST(
                            '' AS XML
                        ).value(
                            'xs:base64Binary(sql:column("DefinitionBinary"))',
                            'VARCHAR(MAX)'
                        ), 'json') +
                    N'"}') COLLATE DATABASE_DEFAULT
                ), N','
        ) + N']' AS all_views_json
    FROM sys.views v
    JOIN sys.schemas s ON v.schema_id = s.schema_id
    JOIN sys.sql_modules m ON v.object_id = m.object_id
    CROSS APPLY
        (SELECT CONVERT(VARBINARY(MAX), m.definition) AS DefinitionBinary) AS bin
    WHERE s.name LIKE '%'
)
SELECT JSON_QUERY(
    N'{
        "fk_info": ' + ISNULL((SELECT cast(all_fks_json as nvarchar(max)) FROM fk_info), N'[]') +
        ', "pk_info": ' + ISNULL((SELECT cast(all_pks_json as nvarchar(max)) FROM pk_info), N'[]') +
        ', "columns": ' + ISNULL((SELECT cast(all_columns_json as nvarchar(max)) FROM cols), N'[]') +
        ', "indexes": ' + ISNULL((SELECT cast(all_indexes_json as nvarchar(max)) FROM indexes), N'[]') +
        ', "tables": ' + ISNULL((SELECT cast(all_tables_json as nvarchar(max)) FROM tbls), N'[]') +
        ', "views": ' + ISNULL((SELECT cast(all_views_json as nvarchar(max)) FROM views), N'[]') +
        ', "database_name": "' + STRING_ESCAPE(DB_NAME(), 'json') +
        '", "version": ""
    }'
) AS metadata_json_to_import;
`,d=`/* SQL Server 2016 and below edition (13.0, 12.0, 11.0..) */
WITH fk_info AS (
    SELECT  JSON_QUERY('[' +
        ISNULL(
            STUFF((
                SELECT ',' +
                    CONVERT(nvarchar(max),
                        JSON_QUERY(N'{
                            "schema": "' + STRING_ESCAPE(COALESCE(REPLACE(tp_schema.name, '"', ''), ''), 'json') +
                            '", "table": "' + STRING_ESCAPE(COALESCE(REPLACE(tp.name, '"', ''), ''), 'json') +
                            '", "column": "' + STRING_ESCAPE(COALESCE(REPLACE(cp.name, '"', ''), ''), 'json') +
                            '", "foreign_key_name": "' + STRING_ESCAPE(COALESCE(REPLACE(fk.name, '"', ''), ''), 'json') +
                            '", "reference_schema": "' + STRING_ESCAPE(COALESCE(REPLACE(tr_schema.name, '"', ''), ''), 'json') +
                            '", "reference_table": "' + STRING_ESCAPE(COALESCE(REPLACE(tr.name, '"', ''), ''), 'json') +
                            '", "reference_column": "' + STRING_ESCAPE(COALESCE(REPLACE(cr.name, '"', ''), ''), 'json') +
                            '", "fk_def": "FOREIGN KEY (' + STRING_ESCAPE(COALESCE(REPLACE(cp.name, '"', ''), ''), 'json') +
                            ') REFERENCES ' + STRING_ESCAPE(COALESCE(REPLACE(tr.name, '"', ''), ''), 'json') +
                            '(' + STRING_ESCAPE(COALESCE(REPLACE(cr.name, '"', ''), ''), 'json') +
                            ') ON DELETE ' + STRING_ESCAPE(fk.delete_referential_action_desc, 'json') +
                            ' ON UPDATE ' + STRING_ESCAPE(fk.update_referential_action_desc, 'json') +
                        '"}') COLLATE DATABASE_DEFAULT
                    )
                FROM sys.foreign_keys AS fk
                JOIN sys.foreign_key_columns AS fkc ON fk.object_id = fkc.constraint_object_id
                JOIN sys.tables AS tp ON fkc.parent_object_id = tp.object_id
                JOIN sys.schemas AS tp_schema ON tp.schema_id = tp_schema.schema_id
                JOIN sys.columns AS cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
                JOIN sys.tables AS tr ON fkc.referenced_object_id = tr.object_id
                JOIN sys.schemas AS tr_schema ON tr.schema_id = tr_schema.schema_id
                JOIN sys.columns AS cr ON fkc.referenced_object_id = cr.object_id AND fkc.referenced_column_id = cr.column_id
                FOR XML PATH('')
            ), 1, 1, ''), '')
    + N']') AS all_fks_json
),
pk_info AS (
    SELECT  JSON_QUERY('[' +
                ISNULL(STUFF((
                    SELECT ',' +
                        CONVERT(nvarchar(max),
                        JSON_QUERY(N'{
                            "schema": "' + STRING_ESCAPE(COALESCE(REPLACE(pk.TABLE_SCHEMA, '"', ''), ''), 'json') +
                            '", "table": "' + STRING_ESCAPE(COALESCE(REPLACE(pk.TABLE_NAME, '"', ''), ''), 'json') +
                            '", "column": "' + STRING_ESCAPE(COALESCE(REPLACE(pk.COLUMN_NAME, '"', ''), ''), 'json') +
                            '", "pk_def": "PRIMARY KEY (' + STRING_ESCAPE(pk.COLUMN_NAME, 'json') + N')"}') COLLATE DATABASE_DEFAULT
                        )
                    FROM
                        (
                            SELECT  kcu.TABLE_SCHEMA,
                                    kcu.TABLE_NAME,
                                    kcu.COLUMN_NAME
                            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
                            JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
                                ON kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
                                AND kcu.CONSTRAINT_SCHEMA = tc.CONSTRAINT_SCHEMA
                            WHERE   tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
                        ) pk
                    FOR XML PATH('')
                ), 1, 1, ''), '')
    + N']') AS all_pks_json
),
cols AS (
    SELECT  JSON_QUERY('[' +
        ISNULL(
            STUFF((
                SELECT ',' +
                    CONVERT(nvarchar(max),
                    JSON_QUERY('{
                                "schema": "' + STRING_ESCAPE(COALESCE(REPLACE(cols.TABLE_SCHEMA, '"', ''), ''), 'json') +
                                '", "table": "' + STRING_ESCAPE(COALESCE(REPLACE(cols.TABLE_NAME, '"', ''), ''), 'json') +
                                '", "name": "' + STRING_ESCAPE(COALESCE(REPLACE(cols.COLUMN_NAME, '"', ''), ''), 'json') +
                                '", "ordinal_position": ' + CAST(cols.ORDINAL_POSITION AS NVARCHAR(MAX)) +
                                ', "type": "' + STRING_ESCAPE(LOWER(cols.DATA_TYPE), 'json') +
                                '", "character_maximum_length": ' +
                                    CASE
                                        WHEN cols.CHARACTER_MAXIMUM_LENGTH IS NULL THEN 'null'
                                        ELSE CAST(cols.CHARACTER_MAXIMUM_LENGTH AS NVARCHAR(MAX))
                                    END +
                                ', "precision": ' +
                                    CASE
                                        WHEN cols.DATA_TYPE IN ('numeric', 'decimal')
                                        THEN '{"precision":' + COALESCE(CAST(cols.NUMERIC_PRECISION AS NVARCHAR(MAX)), 'null') +
                                             ',"scale":' + COALESCE(CAST(cols.NUMERIC_SCALE AS NVARCHAR(MAX)), 'null') + '}'
                                        ELSE 'null'
                                    END +
                                ', "nullable": ' + CASE WHEN cols.IS_NULLABLE = 'YES' THEN 'true' ELSE 'false' END +
                                ', "default": ' +
                                    '"' + STRING_ESCAPE(COALESCE(REPLACE(CAST(cols.COLUMN_DEFAULT AS NVARCHAR(MAX)), '"', '\\"'), ''), 'json') + '"' +
                                ', "collation": ' +
                                    CASE
                                        WHEN cols.COLLATION_NAME IS NULL THEN 'null'
                                        ELSE '"' + STRING_ESCAPE(cols.COLLATION_NAME, 'json') + '"'
                                    END +
                                N'}')
                    )
                FROM
                    INFORMATION_SCHEMA.COLUMNS cols
                WHERE
                    cols.TABLE_CATALOG = DB_NAME()
                FOR XML PATH('')
            ), 1, 1, ''), '')
    + ']') AS all_columns_json
),
indexes AS (
    SELECT
        '[' + ISNULL(
            STUFF((
                SELECT ',' +
                    CONVERT(nvarchar(max),
                    JSON_QUERY(N'{
                        "schema": "' + STRING_ESCAPE(COALESCE(REPLACE(s.name, '"', ''), ''), 'json') +
                        '", "table": "' + STRING_ESCAPE(COALESCE(REPLACE(t.name, '"', ''), ''), 'json') +
                        '", "name": "' + STRING_ESCAPE(COALESCE(REPLACE(i.name, '"', ''), ''), 'json') +
                        '", "column": "' + STRING_ESCAPE(COALESCE(REPLACE(c.name, '"', ''), ''), 'json') +
                        '", "index_type": "' + STRING_ESCAPE(LOWER(i.type_desc), 'json') +
                        '", "unique": ' + CASE WHEN i.is_unique = 1 THEN 'true' ELSE 'false' END +
                        ', "direction": "' + CASE WHEN ic.is_descending_key = 1 THEN 'desc' ELSE 'asc' END +
                        '", "column_position": ' + CAST(ic.key_ordinal AS nvarchar(max)) + N'}'
                    ) COLLATE DATABASE_DEFAULT
                )
                FROM sys.indexes i
                JOIN sys.tables t ON i.object_id = t.object_id
                JOIN sys.schemas s ON t.schema_id = s.schema_id
                JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
                JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
                WHERE s.name LIKE '%'
                        AND i.name IS NOT NULL
                        AND ic.is_included_column = 0
                FOR XML PATH('')
            ), 1, 1, ''), '')
        + N']' AS all_indexes_json
),
tbls AS (
    SELECT
    '[' + ISNULL(
        STUFF((
            SELECT ',' +
                CONVERT(nvarchar(max),
                JSON_QUERY(N'{
                    "schema": "' + STRING_ESCAPE(COALESCE(REPLACE(aggregated.schema_name, '"', ''), ''), 'json') +
                    '", "table": "' + STRING_ESCAPE(COALESCE(REPLACE(aggregated.table_name, '"', ''), ''), 'json') +
                    '", "row_count": ' + CAST(aggregated.row_count AS NVARCHAR(MAX)) +
                    ', "table_type": "' + STRING_ESCAPE(aggregated.table_type, 'json') +
                    '", "creation_date": "' + CONVERT(NVARCHAR(MAX), aggregated.creation_date, 120) + N'"}'
                )
            )
            FROM
                (
                    -- Select from tables
                    SELECT
                        COALESCE(REPLACE(s.name, '"', ''), '') AS schema_name,
                        COALESCE(REPLACE(t.name, '"', ''), '') AS table_name,
                        SUM(p.rows) AS row_count,
                        t.type_desc AS table_type,
                        t.create_date AS creation_date
                    FROM sys.tables t
                    JOIN sys.schemas s ON t.schema_id = s.schema_id
                    JOIN sys.partitions p ON t.object_id = p.object_id AND p.index_id IN (0, 1)
                    WHERE s.name LIKE '%'
                    GROUP BY s.name, t.name, t.type_desc, t.create_date

                    UNION ALL

                    -- Select from views
                    SELECT
                        COALESCE(REPLACE(s.name, '"', ''), '') AS schema_name,
                        COALESCE(REPLACE(v.name, '"', ''), '') AS object_name,
                        0 AS row_count,  -- Views don't have row counts
                        'VIEW' AS object_type,
                        v.create_date AS creation_date
                    FROM sys.views v
                    JOIN sys.schemas s ON v.schema_id = s.schema_id
                    WHERE s.name LIKE '%'
                ) AS aggregated
            FOR XML PATH('')
        ), 1, 1, ''), '')
    + N']' AS all_objects_json
),
views AS (
    SELECT
        '[' +
        (
            SELECT  STUFF((
                        SELECT ',' + CONVERT(nvarchar(max),
                            JSON_QUERY(
                                N'{
                                "schema": "' + STRING_ESCAPE(COALESCE(REPLACE(s.name, '"', ''), ''), 'json') +
                                '", "view_name": "' + STRING_ESCAPE(COALESCE(REPLACE(v.name, '"', ''), ''), 'json') +
                                '", "view_definition": "' +
                                CAST(
                                    (
                                        SELECT CAST(OBJECT_DEFINITION(v.object_id) AS VARBINARY(MAX)) FOR XML PATH('')
                                    ) AS NVARCHAR(MAX)
                                ) + N'"}'
                            )
                        )
                        FROM
                            sys.views v
                        JOIN
                            sys.schemas s ON v.schema_id = s.schema_id
                        WHERE
                            s.name LIKE '%'
                        FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 1, '')
        ) + ']' AS all_views_json
)
SELECT JSON_QUERY(
    N'{
        "fk_info": ' + ISNULL((SELECT cast(all_fks_json as nvarchar(max)) FROM fk_info), N'[]') +
        ', "pk_info": ' + ISNULL((SELECT cast(all_pks_json as nvarchar(max)) FROM pk_info), N'[]') +
        ', "columns": ' + ISNULL((SELECT cast(all_columns_json as nvarchar(max)) FROM cols), N'[]') +
        ', "indexes": ' + ISNULL((SELECT cast(all_indexes_json as nvarchar(max)) FROM indexes), N'[]') +
        ', "tables": ' + ISNULL((SELECT cast(all_objects_json as nvarchar(max)) FROM tbls), N'[]') +
        ', "views": ' + ISNULL((SELECT cast(all_views_json as nvarchar(max)) FROM views), N'[]') +
        ', "database_name": "' + DB_NAME() + '"' +
        ', "version": ""
    }'
) AS metadata_json_to_import;`,O=(t={})=>t.databaseEdition===a.SQL_SERVER_2016_AND_BELOW?d:T,p=`WITH fk_info as (
  (SELECT (@fk_info:=NULL),
              (SELECT (0)
               FROM (SELECT kcu.table_schema,
                kcu.table_name,
                kcu.column_name as fk_column,
                kcu.constraint_name as foreign_key_name,
                kcu.referenced_table_schema as reference_schema,
                kcu.referenced_table_name as reference_table,
                kcu.referenced_column_name as reference_column,
                CONCAT('FOREIGN KEY (', kcu.column_name, ') REFERENCES ',
                       kcu.referenced_table_name, '(', kcu.referenced_column_name, ') ',
                       'ON UPDATE ', rc.update_rule,
                       ' ON DELETE ', rc.delete_rule) AS fk_def
            FROM
                information_schema.key_column_usage kcu
            JOIN
                information_schema.referential_constraints rc
                ON kcu.constraint_name = rc.constraint_name
                    AND kcu.table_schema = rc.constraint_schema
                  AND kcu.table_name = rc.table_name
            WHERE
                kcu.referenced_table_name IS NOT NULL) as fk
               WHERE table_schema LIKE IFNULL(NULL, '%')
                   AND table_schema = DATABASE()
                   AND (0x00) IN (@fk_info:=CONCAT_WS(',', @fk_info, CONCAT('{"schema":"',table_schema,
                                               '","table":"',table_name,
                                               '","column":"', IFNULL(fk_column, ''),
                                                          '","foreign_key_name":"', IFNULL(foreign_key_name, ''),
                                                          '","reference_schema":"', IFNULL(reference_schema, ''),
                                                          '","reference_table":"', IFNULL(reference_table, ''),
                                                          '","reference_column":"', IFNULL(reference_column, ''),
                                                          '","fk_def":"', IFNULL(fk_def, ''),
                                               '"}')))))
), pk_info AS (
    (SELECT (@pk_info:=NULL),
              (SELECT (0)
               FROM (SELECT TABLE_SCHEMA,
                            TABLE_NAME AS pk_table,
                            COLUMN_NAME AS pk_column,
                            (SELECT CONCAT('PRIMARY KEY (', GROUP_CONCAT(inc.COLUMN_NAME ORDER BY inc.ORDINAL_POSITION SEPARATOR ', '), ')')
                               FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE as inc
                               WHERE inc.CONSTRAINT_NAME = 'PRIMARY' and
                                     outc.TABLE_SCHEMA = inc.TABLE_SCHEMA and
                                     outc.TABLE_NAME = inc.TABLE_NAME) AS pk_def
                       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE as outc
                       WHERE CONSTRAINT_NAME = 'PRIMARY'
                       GROUP BY TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME
                       ORDER BY TABLE_SCHEMA, TABLE_NAME, ORDINAL_POSITION) AS pk
               WHERE table_schema LIKE IFNULL(NULL, '%')
               AND table_schema = DATABASE()
               AND (0x00) IN (@pk_info:=CONCAT_WS(',', @pk_info, CONCAT('{"schema":"', table_schema,
                                                                        '","table":"', pk_table,
                                                                        '","column":"', pk_column,
                                                                        '","pk_def":"', IFNULL(pk_def, ''),
                                                                        '"}')))))
), cols as
(
  (SELECT (@cols := NULL),
        (SELECT (0)
         FROM information_schema.columns cols
         WHERE cols.table_schema LIKE IFNULL(NULL, '%')
           AND cols.table_schema = DATABASE()
           AND (0x00) IN (@cols := CONCAT_WS(',', @cols, CONCAT(
                '{"schema":"', cols.table_schema,
                '","table":"', cols.table_name,
                '","name":"', REPLACE(cols.column_name, '"', '\\"'),
                '","type":"', LOWER(cols.data_type),
                '","character_maximum_length":"', IFNULL(cols.character_maximum_length, 'null'),
                '","precision":',
                    CASE
                        WHEN cols.data_type IN ('decimal', 'numeric')
                        THEN CONCAT('{"precision":', IFNULL(cols.numeric_precision, 'null'),
                                    ',"scale":', IFNULL(cols.numeric_scale, 'null'), '}')
                        ELSE 'null'
                    END,
                ',"ordinal_position":"', cols.ordinal_position,
                '","nullable":', IF(cols.is_nullable = 'YES', 'true', 'false'),
                ',"default":"', IFNULL(REPLACE(REPLACE(cols.column_default, '\\\\', ''), '"', '\\"'), ''),
                '","collation":"', IFNULL(cols.collation_name, ''), '"}'
            )))))
), indexes as (
  (SELECT (@indexes:=NULL),
                (SELECT (0)
                 FROM information_schema.statistics indexes
                 WHERE table_schema LIKE IFNULL(NULL, '%')
                     AND table_schema = DATABASE()
                     AND (0x00) IN  (@indexes:=CONCAT_WS(',', @indexes, CONCAT('{"schema":"',indexes.table_schema,
                                         '","table":"',indexes.table_name,
                                         '","name":"', indexes.index_name,
                                         '","size":"',
                                                                      (SELECT IFNULL(SUM(stat_value * @@innodb_page_size), -1) AS size_in_bytes
                                                                       FROM mysql.innodb_index_stats
                                                                       WHERE stat_name = 'size'
                                                                           AND index_name != 'PRIMARY'
                                                                           AND index_name = indexes.index_name
                                                                           AND TABLE_NAME = indexes.table_name
                                                                           AND database_name = indexes.table_schema),
                                                                  '","column":"', indexes.column_name,
                                                      '","index_type":"', LOWER(indexes.index_type),
                                                      '","cardinality":', indexes.cardinality,
                                                      ',"direction":"', (CASE WHEN indexes.collation = 'D' THEN 'desc' ELSE 'asc' END),
                                                      '","unique":', IF(indexes.non_unique = 1, 'false', 'true'), '}')))))
), tbls as
(
  (SELECT (@tbls:=NULL),
              (SELECT (0)
               FROM information_schema.tables tbls
               WHERE table_schema LIKE IFNULL(NULL, '%')
                   AND table_schema = DATABASE()
                   AND (0x00) IN (@tbls:=CONCAT_WS(',', @tbls, CONCAT('{', '"schema":"', \`TABLE_SCHEMA\`, '",',
                                               '"table":"', \`TABLE_NAME\`, '",',
                                             '"rows":', IFNULL(\`TABLE_ROWS\`, 0),
                                             ', "type":"', IFNULL(\`TABLE_TYPE\`, ''), '",',
                                             '"engine":"', IFNULL(\`ENGINE\`, ''), '",',
                                             '"collation":"', IFNULL(\`TABLE_COLLATION\`, ''), '"}')))))
), views as (
(SELECT (@views:=NULL),
              (SELECT (0)
               FROM information_schema.views views
               WHERE table_schema LIKE IFNULL(NULL, '%')
                   AND table_schema = DATABASE()
                   AND (0x00) IN (@views:=CONCAT_WS(',', @views, CONCAT('{', '"schema":"', \`TABLE_SCHEMA\`, '",',
                                                   '"view_name":"', \`TABLE_NAME\`, '",',
                                                   '"view_definition":"', REPLACE(REPLACE(TO_BASE64(VIEW_DEFINITION), ' ', ''), '
', ''), '"}'))) ) )
)
(SELECT CAST(CONCAT('{"fk_info": [',IFNULL(@fk_info,''),
                '], "pk_info": [', IFNULL(@pk_info, ''),
            '], "columns": [',IFNULL(@cols,''),
            '], "indexes": [',IFNULL(@indexes,''),
            '], "tables":[',IFNULL(@tbls,''),
            '], "views":[',IFNULL(@views,''),
            '], "database_name": "', DATABASE(),
            '", "version": "', VERSION(), '"}') AS CHAR) AS metadata_json_to_import
 FROM fk_info, pk_info, cols, indexes, tbls, views);
`,R=`WITH
cols AS (
    SELECT arrayStringConcat(arrayMap(col_tuple ->
        concat('{"schema":"', col_tuple.1, '"',
               ',"table":"', col_tuple.2, '"',
               ',"name":"', col_tuple.3, '"',
               ',"ordinal_position":"', toString(col_tuple.4), '"',
               ',"type":"', col_tuple.5, '"',
               ',"nullable":"', if(col_tuple.6 = 'NULLABLE', 'true', 'false'), '"',
               ',"default":"', if(col_tuple.7 = '', 'null', col_tuple.7), '"',
               ',"comment":', if(col_tuple.8 = '', '""', toString(toJSONString(col_tuple.8))), '}'),
        groupArray((
            col.database,
            col.table,
            col.name,
            col.position,
            col.type,
            col.default_kind,
            col.default_expression,
            col.comment
        ))
    ), ',') AS cols_metadata
    FROM system.columns AS col
    JOIN system.tables AS tbl
        ON col.database = tbl.database AND col.table = tbl.name
    WHERE lower(col.database) NOT IN ('system', 'information_schema')
            AND lower(col.table) NOT LIKE '.inner_id.%'
            AND tbl.is_temporary = 0  -- Exclude temporary tables if desired
),
tbl_sizes AS (
    SELECT database, table, sum(bytes_on_disk) AS size
    FROM system.parts
    GROUP BY database, table
),
tbls AS (
    SELECT arrayStringConcat(arrayMap(tbl_tuple ->
        concat('{"schema":"', tbl_tuple.1, '"',
               ',"table":"', tbl_tuple.2, '"',
               ',"rows":', toString(tbl_tuple.3),
               ',"type":"', tbl_tuple.4, '"',
               ',"engine":"', tbl_tuple.5, '"',
               ',"collation":"",',
               '"size":', toString(tbl_tuple.6), ',',
               '"comment":', if(tbl_tuple.7 = '', '""', toString(toJSONString(tbl_tuple.7))), '}'),
        groupArray((
            tbl.database,          -- tbl_tuple.1
            tbl.name,              -- tbl_tuple.2
            tbl.total_rows, -- tbl_tuple.3
            tbl.type,              -- tbl_tuple.4
            tbl.engine,            -- tbl_tuple.5
            coalesce(ts.size, 0),  -- tbl_tuple.6
            tbl.comment            -- tbl_tuple.7
        ))
    ), ',') AS tbls_metadata
    FROM (
        SELECT
            tbl.database,
            tbl.name,
            coalesce(tbl.total_rows, 0) as total_rows,
            -- Determine the type based on the engine
            if(tbl.engine = 'View', 'VIEW',
                if(tbl.engine = 'MaterializedView', 'MATERIALIZED VIEW', 'TABLE')) AS type,
            tbl.engine,
            tbl.comment
        FROM system.tables AS tbl
        WHERE lower(tbl.database) NOT IN ('system', 'information_schema')
            AND lower(tbl.name) NOT LIKE '.inner_id.%'
            AND tbl.is_temporary = 0
    ) AS tbl
    LEFT JOIN tbl_sizes AS ts
        ON tbl.database = ts.database AND tbl.name = ts.table
    -- GROUP BY tbl.database, tbl.name, tbl.total_rows, tbl.type, tbl.engine, tbl.comment, ts.size
),
indexes AS (
    SELECT arrayStringConcat(arrayMap((db, tbl, name) ->
        concat('{"schema":"', db, '"',
               ',"table":"', tbl, '"',
               ',"name":"', name, '"',
               ',"index_type":"",',
               '"cardinality":"",',
               '"size":"",',
               '"unique":"false"}'),
        groupArray((idx.database, idx.table, idx.name))
    ), ',') AS indexes_metadata
    FROM system.data_skipping_indices AS idx
    WHERE lower(idx.database) NOT IN ('system', 'information_schema')
            AND lower(idx.table) NOT LIKE '.inner_id.%'
),
views AS (
    SELECT arrayStringConcat(arrayMap((db, name, definition) ->
        concat('{"schema":"', db, '"',
               ',"view_name":"', name, '"',
               ',"view_definition":"',
               base64Encode(replaceAll(replaceAll(definition, '\\\\', '\\\\\\\\'), '"', '\\\\"')), '"}'),
        groupArray((vw.database, vw.name, vw.create_table_query))
    ), ',') AS views_metadata
    FROM system.tables AS vw
    WHERE vw.engine in ('View', 'MaterializedView')
      AND lower(vw.database) NOT IN ('system', 'information_schema')
),
pks AS (
    SELECT
        col.database AS schema_name,
        col.table AS table_name,
        groupArray(col.name) AS pk_columns,
        concat('PRIMARY KEY(', arrayStringConcat(groupArray(col.name), ', '), ')') AS pk_def
    FROM system.columns AS col
    WHERE col.is_in_primary_key = 1
        AND lower(col.database) NOT IN ('system', 'information_schema')
        AND lower(col.table) NOT LIKE '.inner_id.%'
    GROUP BY col.database, col.table
),
pks_metadata AS (
    SELECT arrayStringConcat(arrayMap(pk_tuple ->
        concat('{"schema":"', pk_tuple.1, '"',
                ',"table":"', pk_tuple.2, '"',
                ',"column":"', pk_tuple.3, '"',
                ',"pk_def":"', pk_tuple.4, '"}'),
        groupArray((
            pks.schema_name,
            pks.table_name,
            arrayJoin(pks.pk_columns),
            pks.pk_def
        ))
    ), ',') AS pk_metadata
    FROM pks
)
SELECT
    concat('{
        "fk_info": [],',
        '"pk_info": [', COALESCE((SELECT pk_metadata FROM pks_metadata), ''), '],',
        '"columns": [', COALESCE((SELECT cols_metadata FROM cols), ''),
        '], "indexes": [', COALESCE((SELECT indexes_metadata FROM indexes), ''),
        '], "tables":[', COALESCE((SELECT tbls_metadata FROM tbls), ''),
        '], "views":[', COALESCE((SELECT views_metadata FROM views), ''),
        '], "database_name": "', currentDatabase(), '", "version": "', version(), '"}'
) AS metadata_json_to_import;`,o=`
AND connamespace::regnamespace::text NOT IN ('pg_extension', 'crdb_internal')
`,u=`
AND cols.table_schema NOT IN ('pg_extension', 'crdb_internal')
`,b=`
AND tbls.table_schema NOT IN ('pg_extension', 'crdb_internal')
`,I=`
WHERE schema_name NOT IN ('pg_extension', 'crdb_internal')
`,f=`
AND views.schemaname NOT IN ('pg_extension', 'crdb_internal')
`,M=`/* CockroachDB - PostgreSQL edition */
WITH fk_info AS (
    SELECT array_to_string(array_agg(CONCAT('{"schema":"', replace(schema_name::TEXT, '"', ''), '"',
                                            ',"table":"', replace(table_name::TEXT, '"', ''), '"',
                                            ',"column":"', replace(fk_column::TEXT, '"', ''), '"',
                                            ',"foreign_key_name":"', foreign_key_name::TEXT, '"',
                                            ',"reference_schema":"', COALESCE(reference_schema::TEXT, 'public'), '"',
                                            ',"reference_table":"', reference_table::TEXT, '"',
                                            ',"reference_column":"', reference_column::TEXT, '"',
                                            ',"fk_def":"', replace(fk_def::TEXT, '"', ''),
                                            '"}')), ',') as fk_metadata
    FROM (
            SELECT c.conname AS foreign_key_name,
                    n.nspname AS schema_name,
                    CASE
                        WHEN position('.' in conrelid::regclass::text) > 0
                        THEN split_part(conrelid::regclass::text, '.', 2)
                        ELSE conrelid::regclass::text
                    END AS table_name,
                    a.attname AS fk_column,
                    nr.nspname AS reference_schema,
                    CASE
                        WHEN position('.' in confrelid::regclass::text) > 0
                        THEN split_part(confrelid::regclass::text, '.', 2)
                        ELSE confrelid::regclass::text
                    END AS reference_table,
                    af.attname AS reference_column,
                    pg_get_constraintdef(c.oid) as fk_def
                FROM
                    pg_constraint AS c
                JOIN
                    pg_attribute AS a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
                JOIN
                    pg_class AS cl ON cl.oid = c.conrelid
                JOIN
                    pg_namespace AS n ON n.oid = cl.relnamespace
                JOIN
                    pg_attribute AS af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
                JOIN
                    pg_class AS clf ON clf.oid = c.confrelid
                JOIN
                    pg_namespace AS nr ON nr.oid = clf.relnamespace
                WHERE
                    c.contype = 'f'
                    AND connamespace::regnamespace::text NOT IN ('information_schema', 'pg_catalog')${o}
    ) AS x
), pk_info AS (
    SELECT array_to_string(array_agg(CONCAT('{"schema":"', replace(schema_name::TEXT, '"', ''), '"',
                                            ',"table":"', replace(pk_table::TEXT, '"', ''), '"',
                                            ',"column":"', replace(pk_column::TEXT, '"', ''), '"',
                                            ',"pk_def":"', replace(pk_def::TEXT, '"', ''),
                                            '"}')), ',') AS pk_metadata
    FROM (
            SELECT connamespace::regnamespace::text AS schema_name,
                CASE
                    WHEN strpos(conrelid::regclass::text, '.') > 0
                    THEN split_part(conrelid::regclass::text, '.', 2)
                    ELSE conrelid::regclass::text
                END AS pk_table,
                unnest(string_to_array(substring(pg_get_constraintdef(oid) FROM '\\((.*?)\\)'), ',')) AS pk_column,
                pg_get_constraintdef(oid) as pk_def
            FROM
              pg_constraint
            WHERE
              contype = 'p'
              AND connamespace::regnamespace::text NOT IN ('information_schema', 'pg_catalog')${o}
    ) AS y
),
indexes_cols AS (
    SELECT  tnsp.nspname                                                                AS schema_name,
        trel.relname                                                                    AS table_name,
            null                                                                        AS index_size,
            irel.relname                                                                AS index_name,
            am.amname                                                                   AS index_type,
            a.attname                                                                   AS col_name,
            (CASE WHEN i.indisunique = TRUE THEN 'true' ELSE 'false' END)               AS is_unique,
            irel.reltuples                                                              AS cardinality,
            1 + Array_position(i.indkey, a.attnum)                                      AS column_position,
            CASE o.OPTION & 1 WHEN 1 THEN 'DESC' ELSE 'ASC' END                         AS direction,
            CASE WHEN indpred IS NOT NULL THEN 'true' ELSE 'false' END                  AS is_partial_index
    FROM pg_index AS i
        JOIN pg_class AS trel ON trel.oid = i.indrelid
        JOIN pg_namespace AS tnsp ON trel.relnamespace = tnsp.oid
        JOIN pg_class AS irel ON irel.oid = i.indexrelid
        JOIN pg_am AS am ON irel.relam = am.oid
        CROSS JOIN LATERAL unnest (i.indkey)
        WITH ORDINALITY AS c (colnum, ordinality) LEFT JOIN LATERAL unnest (i.indoption)
        WITH ORDINALITY AS o (option, ordinality)
        ON c.ordinality = o.ordinality JOIN pg_attribute AS a ON trel.oid = a.attrelid AND a.attnum = c.colnum
    WHERE tnsp.nspname NOT LIKE 'pg_%'
    GROUP BY tnsp.nspname, trel.relname, irel.relname, am.amname, i.indisunique, i.indexrelid, irel.reltuples, a.attname, Array_position(i.indkey, a.attnum), o.OPTION, i.indpred
),
cols AS (
    SELECT array_to_string(array_agg(CONCAT('{"schema":"', cols.table_schema::TEXT,
                                            '","table":"', cols.table_name::TEXT,
                                            '","name":"', cols.column_name::TEXT,
                                            '","ordinal_position":"', cols.ordinal_position::TEXT,
                                            '","type":"', LOWER(replace(cols.data_type::TEXT, '"', '')),
                                            '","character_maximum_length":"', COALESCE(cols.character_maximum_length::TEXT, 'null'),
                                            '","precision":',
                                                CASE
                                                    WHEN cols.data_type = 'numeric' OR cols.data_type = 'decimal'
                                                    THEN CONCAT('{"precision":', COALESCE(cols.numeric_precision::TEXT, 'null'),
                                                                ',"scale":', COALESCE(cols.numeric_scale::TEXT, 'null'), '}')
                                                    ELSE 'null'
                                                END,
                                            ',"nullable":', CASE WHEN (cols.IS_NULLABLE = 'YES') THEN 'true' ELSE 'false' END::TEXT,
                                            ',"default":"', COALESCE(replace(replace(cols.column_default::TEXT, '"', '\\"'), '\\x', '\\\\x'), ''),
                                            '","collation":"', COALESCE(cols.COLLATION_NAME::TEXT, ''),
                                            '","comment":"', COALESCE(replace(replace(dsc.description::TEXT, '"', '\\"'), '\\x', '\\\\x'), ''),
                                            '"}')), ',') AS cols_metadata
    FROM information_schema.columns cols
    LEFT JOIN pg_catalog.pg_class c
        ON c.relname = cols.table_name
    JOIN pg_catalog.pg_namespace n
        ON n.oid = c.relnamespace AND n.nspname = cols.table_schema
    LEFT JOIN pg_catalog.pg_description dsc ON dsc.objoid = c.oid
                                        AND dsc.objsubid = cols.ordinal_position
    WHERE cols.table_schema NOT IN ('information_schema', 'pg_catalog')${u}
), indexes_metadata AS (
    SELECT array_to_string(array_agg(CONCAT('{"schema":"', schema_name::TEXT,
                                            '","table":"', table_name::TEXT,
                                            '","name":"', index_name::TEXT,
                                            '","column":"', replace(col_name::TEXT, '"', E'"'),
                                            '","index_type":"', index_type::TEXT,
                                            '","cardinality":', COALESCE(cardinality::TEXT, '0'),
                                            ',"size":', COALESCE(index_size::TEXT, 'null'),
                                            ',"unique":', is_unique::TEXT,
                                            ',"is_partial_index":', is_partial_index::TEXT,
                                            ',"column_position":', column_position::TEXT,
                                            ',"direction":"', LOWER(direction::TEXT),
                                            '"}')), ',') AS indexes_metadata
    FROM indexes_cols x${I}
), tbls AS (
    SELECT array_to_string(array_agg(CONCAT('{',
                        '"schema":"', tbls.TABLE_SCHEMA::TEXT, '",',
                        '"table":"', tbls.TABLE_NAME::TEXT, '",',
                        '"rows":', COALESCE((SELECT s.n_live_tup::TEXT
                                                FROM pg_stat_user_tables s
                                                WHERE tbls.TABLE_SCHEMA = s.schemaname AND tbls.TABLE_NAME = s.relname),
                                                '0'), ', "type":"', tbls.TABLE_TYPE::TEXT, '",', '"engine":"",', '"collation":"",',
                        '"comment":"', COALESCE(replace(replace(dsc.description::TEXT, '"', '\\"'), '\\x', '\\\\x'), ''),
                        '"}'
                )),
                ',') AS tbls_metadata
        FROM information_schema.tables tbls
        LEFT JOIN pg_catalog.pg_class c ON c.relname = tbls.TABLE_NAME
        JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
                                            AND n.nspname = tbls.TABLE_SCHEMA
        LEFT JOIN pg_catalog.pg_description dsc ON dsc.objoid = c.oid
                                                AND dsc.objsubid = 0
        WHERE tbls.TABLE_SCHEMA NOT IN ('information_schema', 'pg_catalog')${b}
), config AS (
    SELECT array_to_string(
                      array_agg(CONCAT('{"name":"', conf.name, '","value":"', replace(conf.setting, '"', E'"'), '"}')),
                      ',') AS config_metadata
    FROM pg_settings conf
), views AS (
    SELECT array_to_string(array_agg(CONCAT('{"schema":"', views.schemaname::TEXT,
                      '","view_name":"', viewname::TEXT,
                      '","view_definition":"', encode(convert_to(REPLACE(definition::TEXT, '"', '\\"'), 'UTF8'), 'base64'),
                    '"}')),
                      ',') AS views_metadata
    FROM pg_views views
    WHERE views.schemaname NOT IN ('information_schema', 'pg_catalog')${f}
)
SELECT CONCAT('{    "fk_info": [', COALESCE(fk_metadata, ''),
                    '], "pk_info": [', COALESCE(pk_metadata, ''),
                    '], "columns": [', COALESCE(cols_metadata, ''),
                    '], "indexes": [', COALESCE(indexes_metadata, ''),
                    '], "tables":[', COALESCE(tbls_metadata, ''),
                    '], "views":[', COALESCE(views_metadata, ''),
                    '], "database_name": "', CURRENT_DATABASE(), '', '", "version": "', '',
              '"}') AS metadata_json_to_import
FROM fk_info, pk_info, cols, indexes_metadata, tbls, config, views;
`,G={[n.GENERIC]:()=>"",[n.POSTGRESQL]:S,[n.MYSQL]:L,[n.SQLITE]:()=>C,[n.SQL_SERVER]:O,[n.MARIADB]:()=>p,[n.CLICKHOUSE]:()=>R,[n.COCKROACHDB]:()=>M};export{G as importMetadataScripts};
