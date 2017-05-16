
package com.smi.dao;

import com.smi.model.Dashboard;
import java.util.List;


public interface DashboardDao {
    
    Long save(Dashboard dashboard);
    void edit(Dashboard dashboard);
    
    List<Dashboard> getAllDashboard();
    Dashboard getDashboard(Long id_dashboard);
    
    void delete(Dashboard d);
    Boolean doesExist(String name);
}
