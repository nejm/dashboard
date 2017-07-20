package com.smi.service;

import com.smi.controller.AngularController;
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
import java.util.TimeZone;
import java.util.logging.Level;
import oracle.jdbc.OracleConnection;
import oracle.jdbc.pool.OracleDataSource;
import org.apache.log4j.Logger;

/**
 *
 * @author Nejm
 */
public class TableHelper {

    private String serverName, username, password, databaseName, driverType, tableName;
    private int portNumber;

    final static Logger logger = Logger.getLogger(TableHelper.class);

    public TableHelper(String s, String u, String p, String db, String dt, int port, String t) throws SQLException {
        serverName = s;
        username = u;
        password = p;
        databaseName = db;
        driverType = dt;
        tableName = t;
        portNumber = port;

    }

    public boolean testConnection() throws SQLException {

        Connection ocon = DriverManager.getConnection("jdbc:oracle:thin:@"+serverName+":"+portNumber+":"+databaseName,username,password);
        return ocon.isValid(5);
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

        System.out.println(serverName + ":" + username + ":" + password + ":" + databaseName + ":" + portNumber + ":" + driverType);

        OracleConnection ocon = (OracleConnection) dataSource.getConnection();
        ocon.setAutoCommit(false);
        Statement stmt = ocon.createStatement();

        ResultSet rset = stmt.executeQuery("select * from " + tableName);
        ResultSetMetaData rsmd = rset.getMetaData();
        int columnsNumber = rsmd.getColumnCount();
        for (int i = 1; i <= columnsNumber; i++) {
            list.add(rsmd.getColumnName(i));
        }

        ocon.close();
        return list;
    }

    public List<String> getAllResultNamesMySql() throws SQLException, ClassNotFoundException {
        List<String> list = new ArrayList<>();
        Class.forName("com.mysql.jdbc.Driver");
        if (username == null) {
            username = "";
        }
        if (password == null) {
            password = "";
        }
        Connection ocon = (Connection) DriverManager.getConnection("jdbc:mysql://" + serverName + ":" + portNumber + "/" + databaseName, username, password);
        Statement stmt = ocon.createStatement();

        ResultSet rset = stmt.executeQuery("select * from " + tableName);
        ResultSetMetaData rsmd = rset.getMetaData();
        int columnsNumber = rsmd.getColumnCount();
        for (int i = 1; i <= columnsNumber; i++) {
            list.add(rsmd.getColumnName(i));
        }

        ocon.close();
        return list;
    }

    public HashMap<Integer, List<String>> getAllResultMySql() throws SQLException, ClassNotFoundException {
        HashMap<Integer, List<String>> map = new LinkedHashMap<>();
        List<String> list = new ArrayList<>();

        Class.forName("com.mysql.jdbc.Driver");
        if (username == null) {
            username = "";
        }
        if (password == null) {
            password = "";
        }
        Connection ocon = (Connection) DriverManager.getConnection("jdbc:mysql://" + serverName + ":" + portNumber + "/" + databaseName, username, password);
        Statement stmt = ocon.createStatement();

        ResultSet rset = stmt.executeQuery("select * from " + tableName);
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

        ocon.close();
        return map;
    }

    public HashMap<Integer, List<String>> getAllResult() throws SQLException {
        HashMap<Integer, List<String>> map = new LinkedHashMap<>();
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
        int k = 0;
        while (rset.next()) {
            list = new ArrayList<>();
            for (int i = 1; i <= columnsNumber; i++) {
                list.add(rset.getString(i));
            }
            map.put(k, list);
            k++;
        }

        ocon.close();
        return map;
    }

}
