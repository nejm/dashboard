package com.smi.service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import oracle.jdbc.OracleConnection;
import oracle.jdbc.pool.OracleDataSource;

/**
 *
 * @author Nejm
 */
public class TableHelper {

    private String serverName, username, password, databaseName, driverType, tableName;
    private int portNumber;

    public TableHelper(String s, String u, String p, String db, String dt, int port, String t) throws SQLException {
        serverName = s;
        username = u;
        password = p;
        databaseName = db;
        driverType = dt;
        tableName = t;
        portNumber = port;

    }

    public List<String> getAllResultNames() throws SQLException {
        List<String> list = new ArrayList<>();
        OracleDataSource dataSource = new OracleDataSource();

        dataSource.setServerName(serverName);
        dataSource.setUser(username);
        dataSource.setPassword(password);
        dataSource.setDatabaseName(databaseName);
        dataSource.setPortNumber(portNumber);
        dataSource.setDriverType(driverType);

        OracleConnection ocon = (OracleConnection) dataSource.getConnection();
        ocon.setAutoCommit(false);
        Statement stmt = ocon.createStatement();
        ResultSet rset = stmt.executeQuery("select * from " + tableName);
        ResultSetMetaData rsmd = rset.getMetaData();
        int columnsNumber = rsmd.getColumnCount();
        for (int i = 1; i <= columnsNumber; i++) {
            list.add(rsmd.getColumnName(i));
        }

        return list;
    }

    public  HashMap<Integer,List<String>> getAllResult() throws SQLException {
        HashMap<Integer,List<String>> map = new LinkedHashMap<>();
        List<String> list = new ArrayList<>();
        OracleDataSource dataSource = new OracleDataSource();

        dataSource.setServerName(serverName);
        dataSource.setUser(username);
        dataSource.setPassword(password);
        dataSource.setDatabaseName(databaseName);
        dataSource.setPortNumber(portNumber);
        dataSource.setDriverType(driverType);

        OracleConnection ocon = (OracleConnection) dataSource.getConnection();
        ocon.setAutoCommit(false);
        Statement stmt = ocon.createStatement();
        ResultSet rset = stmt.executeQuery("select * from USERDB");
        ResultSetMetaData rsmd = rset.getMetaData();
        int columnsNumber = rsmd.getColumnCount();
        int k = 0;
        while (rset.next()) {
            list = new ArrayList<>();
            for (int i = 1; i <= columnsNumber; i++) {
                list.add(rset.getString(i));
            }
            map.put(k, list);
            k++;
        }

        return map;
    }

}
