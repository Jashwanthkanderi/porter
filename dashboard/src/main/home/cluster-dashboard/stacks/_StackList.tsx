import DynamicLink from "components/DynamicLink";
import Loading from "components/Loading";
import React, { useContext, useEffect, useState } from "react";
import api from "shared/api";
import { Context } from "shared/Context";
import Placeholder from "components/Placeholder";
import styled from "styled-components";
import { Stack } from "./types";
import { readableDate } from "shared/string_utils";
import { CardGrid, Card } from "./launch/components/styles";

const StackList = ({ namespace }: { namespace: string }) => {
  const { currentProject, currentCluster, setCurrentError } = useContext(
    Context
  );
  const [stacks, setStacks] = useState<Stack[]>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = (stack: Stack) => {
    setDeleting(stack.id);
    api
      .deleteStack(
        "<token>",
        {},
        {
          namespace,
          project_id: currentProject.id,
          cluster_id: currentCluster.id,
          stack_id: stack.id,
        }
      )
      .then(() => {
        setStacks((prev) => prev.filter((s) => s.id !== stack.id));
      })
      .catch((err) => {
        setCurrentError(err);
      })
      .finally(() => {
        setDeleting(null);
      });
  };

  useEffect(() => {
    let isSubscribed = true;

    setIsLoading(true);

    api
      .listStacks(
        "<token>",
        {},
        {
          project_id: currentProject.id,
          cluster_id: currentCluster.id,
          namespace,
        }
      )
      .then((res) => {
        if (isSubscribed) {
          setStacks(res.data);
        }
      })
      .catch((err) => {
        if (isSubscribed) {
          setCurrentError(err);
        }
      })
      .finally(() => {
        if (isSubscribed) {
          setIsLoading(false);
        }
      });
  }, [namespace]);

  if (isLoading) {
    return <Loading />;
  }

  if (stacks?.length === 0) {
    return (
      <Placeholder height="250px">
        <div>
          <h3>No stacks found</h3>
          <p>You can create a stack by clicking the "Create Stack" button.</p>
        </div>
      </Placeholder>
    );
  }

  return (
    <>
      <CardGrid>
        {stacks.map((stack) => (
          <StackCard
            as={DynamicLink}
            key={stack?.id}
            to={`/stacks/${namespace}/${stack?.id}`}
          >
            <DataContainer>
              <StackName>
                <StackIcon>
                  <i className="material-icons-outlined">lan</i>
                </StackIcon>
                <span>{stack.name}</span>
              </StackName>

              <Flex>
                <DeploymentImageContainer>
                  <InfoWrapper>
                    <LastDeployed>
                      <Revision>
                        {!stack.latest_revision?.id
                          ? `No version found`
                          : `v${stack.latest_revision.id}`}
                      </Revision>
                      <SepDot>•</SepDot>
                      Last updated {readableDate(stack.updated_at)}
                    </LastDeployed>
                  </InfoWrapper>
                </DeploymentImageContainer>
              </Flex>
            </DataContainer>
            <Flex>
              <RowButton
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete(stack);
                }}
                disabled={
                  deleting === stack.id || (deleting && deleting === stack.id)
                }
              >
                <i className="material-icons">delete</i>

                {deleting === stack.id ? <Loading /> : "Delete"}
              </RowButton>
            </Flex>
          </StackCard>
        ))}
      </CardGrid>
    </>
  );
};

export default StackList;

const RowButton = styled.button`
  min-width: 82px;
  white-space: nowrap;
  font-size: 12px;
  padding: 8px 10px;
  font-weight: 400;
  height: 32px;
  margin-right: 5px;
  margin-left: 10px;
  border-radius: 5px;
  color: #ffffff;
  border: 1px solid #aaaabb;
  display: flex;
  align-items: center;
  background: #ffffff08;
  cursor: pointer;
  :hover {
    background: #ffffff22;
  }

  > i {
    font-size: 14px;
    margin-right: 8px;
  }
`;

const Revision = styled.div`
  color: #aaaabb;
`;

const StackIcon = styled.div`
  margin-bottom: -4px;

  > i {
    font-size: 18px;
    margin-left: -1px;
    margin-right: 9px;
    color: #ffffff66;
  }
`;

const StackName = styled.div`
  font-family: "Work Sans", sans-serif;
  font-weight: 500;
  color: #ffffff;
  display: flex;
  font-size: 14px;
  align-items: center;
  margin-bottom: 10px;
`;

const SepDot = styled.div`
  color: #aaaabb66;
  margin: 0 9px;
`;

const InfoWrapper = styled.div`
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
`;

const LastDeployed = styled.div`
  font-size: 13px;
  margin-top: -1px;
  display: flex;
  align-items: center;
  color: #aaaabb66;
`;

const DeploymentImageContainer = styled.div`
  height: 20px;
  font-size: 13px;
  position: relative;
  display: flex;
  align-items: center;
  font-weight: 400;
  justify-content: center;
  color: #ffffff66;
  margin-left: 1px;
`;

const Flex = styled.div`
  display: flex;
  align-items: center;
`;

const DataContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  max-width: calc(100% - 100px);
  overflow: hidden;
`;

const StackCard = styled(Card)`
  font-size: 13px;
  font-weight: 500;
`;
