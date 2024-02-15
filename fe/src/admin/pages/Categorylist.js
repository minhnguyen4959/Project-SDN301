import {
  Button,
  Col,
  Modal,
  Form as ReactBootstrapForm,
  Row,
  Table,
  Container,
} from "react-bootstrap";
import Paginate from "../components/Paginate";
import { Link } from "react-router-dom";

import * as yup from "yup";
import { Form, Formik, useFormik } from "formik";
import { toast } from "react-toastify";
import CustomInput from "../../components/CustomInput";
import { useEffect, useState } from "react";
import axios from "axios";

const categorySchema = yup.object({
  name: yup.string().required("This field is required"),
});

const initialValues = {
  name: "",
};

const Categorylist = () => {
  const [action, setAction] = useState("");
  const [category, setCategory] = useState({});
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [nameSearch, setNameSearch] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues,
    validationSchema: categorySchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      handleCreateOk(values);
      setIsLoading(false);
    },
  });

  const saveCategory = (values) => {
    const { name } = values;

    axios
      .post(`http://localhost:9999/categories`, {
        name,
      })
      .then(() => {
        toast.success("Create category successfully");
        fetchCategories();
      })
      .catch(() => toast.error("Something went wrong!"));
  };

  const updateCategory = (values) => {
    const { name } = values;

    axios
      .patch(`http://localhost:9999/categories/${category._id}`, {
        name,
      })
      .then(() => {
        toast.success("Update category successfully");
        fetchCategories();
      })
      .catch(() => toast.error("Something went wrong!"));
  };

  const handleCreateOk = (values) => {
    if (formik.dirty) {
      if (action === "Edit") {
        updateCategory(values);
      } else {
        saveCategory(values);
      }

      setShow(false);
    }

    return;
  };

  const handleClose = () => {
    setShow(false);
  };
  const handleShow = (id) => {
    setShow(true);
  };

  const fetchCategories = (page) => {
    let url = `http://localhost:9999/categories/all?page=${page}`;

    if (nameSearch) {
      url += `&name=${nameSearch}`;
    }

    axios(url)
      .then((res) => {
        setTotalPages(res.data.totalPages);
        setCategories(res.data.docs);
      })
      .catch((err) => toast.error(err));
  };

  useEffect(() => {
    fetchCategories(currentPage);
  }, [currentPage, nameSearch]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <Container>
      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      <Col lg={12}>
        <h3 className="mt-2 text-center">Category List</h3>
        <Row className="my-4">
          <Col xs={12} md={9}>
            <ReactBootstrapForm.Group
              className="mb-3"
              controlId="exampleForm.ControlInput1"
            >
              <ReactBootstrapForm.Control
                type="name"
                placeholder="Search by name..."
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
              />
            </ReactBootstrapForm.Group>
          </Col>
          <Col xs={12} md={3} style={{ textAlign: "right" }}>
            <Button
              variant="primary"
              onClick={() => {
                setAction("Create");
                formik.setFieldValue("name", undefined);
                handleShow();
              }}
            >
              <Link className="text-white">Add Category</Link>
            </Button>
          </Col>
        </Row>
        <Table striped bordered hover variant="light">
          <thead>
            <tr>
              <th>Id</th>
              <th>Name</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {categories
              .filter((p) => {
                const nameMatches =
                  !nameSearch ||
                  p.name.toLowerCase().includes(nameSearch.toLowerCase());
                return nameMatches;
              })
              .map((c) => (
                <tr key={c._id}>
                  <td>{c._id}</td>
                  <td>{c.name}</td>
                  <td className="text-center">
                    <Button
                      variant="primary"
                      className="mx-2"
                      onClick={() => {
                        setAction("Edit");
                        formik.setFieldValue("name", c.name);
                        setCategory(c)
                        handleShow();
                      }}
                    >
                      Edit
                    </Button>
                    <Modal show={show} onHide={handleClose}>
                      <Modal.Header closeButton>
                        <Modal.Title>
                          {action === "Create"
                            ? "Create category"
                            : "Update category"}
                        </Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <Formik
                          initialValues={initialValues}
                          onSubmit={formik.handleSubmit}
                        >
                          {({ values }) => (
                            <Form>
                              <Row>
                                <Col xs={12} lg={6} className="my-3">
                                  <label>Name</label>
                                  <CustomInput
                                    type="text"
                                    name="name"
                                    placeholder="Category name..."
                                    onChange={formik.handleChange("name")}
                                    onBlur={formik.handleBlur("name")}
                                    value={formik.values?.name}
                                    errMes={
                                      formik.touched.name && formik.errors.name
                                    }
                                  />
                                </Col>
                                <Col
                                  xs={12}
                                  className="mb-3"
                                  style={{ textAlign: "right" }}
                                >
                                  <Button
                                    className="btn-primary mx-2"
                                    type="submit"
                                  >
                                    Submit
                                  </Button>
                                </Col>
                              </Row>
                            </Form>
                          )}
                        </Formik>
                      </Modal.Body>
                    </Modal>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
        <div className="pagination mb-3 justify-content-end">
          <Paginate
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            handlePrevPage={handlePrevPage}
            handleNextPage={handleNextPage}
          />
        </div>
      </Col>
    </Container>
  );
};

export default Categorylist;
