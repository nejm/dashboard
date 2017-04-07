/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.smi.dao;

import com.smi.model.Users;
import java.util.List;


public interface UserDao {
    Users findById(long id);
    Users findByUsername(String username);
    List<Users> findAll();
    List<String> findRoles(long id);
}
