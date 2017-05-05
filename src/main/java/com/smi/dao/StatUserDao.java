package com.smi.dao;

import com.smi.model.Statuser;
import java.util.List;

/**
 *
 * @author Nejm
 */
public interface StatUserDao {
    
    void save(Statuser statuser);
    void edit(Statuser statuser);
    void delete(Statuser statuser);
    List<Statuser> findByUser(String username);
    List<Statuser> findByRole(String roleName);
    List<Statuser> findByStats(Long id);
}
