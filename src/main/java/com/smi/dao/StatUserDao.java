package com.smi.dao;

import com.smi.model.Statuser;

/**
 *
 * @author Nejm
 */
public interface StatUserDao {
    
    void save(Statuser statuser);
    void edit(Statuser statuser);
}
